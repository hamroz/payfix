import { createHash } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { Db, Executor } from "@/lib/db/client";
import {
  approvals,
  businesses,
  caseTransfers,
  cases,
  customers,
  proposals,
  refunds,
  resolutionLinks,
  transfers,
  type DestinationProof,
  type ProposalLine,
} from "@/lib/db/schema";
import { move, type PostingDraft } from "@/lib/domain/ledger";
import { canonicalLines, describeChanges, hashProposal, lineAmount, parseLines, validateProposal } from "@/lib/domain/proposal";
import { env } from "@/lib/env";
import { newId, newToken } from "@/lib/ids";
import { formatUsd } from "@/lib/money";
import { destinationProofMessage, verifyWalletSignature } from "@/lib/solana/proof";
import { ata, isWalletAddress } from "@/lib/solana/tx";
import { deliverOutbox, queueEmail } from "./email";
import { logEvent, logInvoicePaid, postEntry } from "./journal";
import { caseAvailable, caseSources, invoicesWithBalances } from "./queries";

export class ResolutionError extends Error {}

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const LINK_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function lockCase(t: Executor, caseId: string) {
  const [c] = await t.select().from(cases).where(eq(cases.id, caseId)).for("update");
  if (!c) throw new ResolutionError("Case not found");
  return c;
}

export async function latestProposal(db: Executor, caseId: string) {
  const [p] = await db.select().from(proposals).where(eq(proposals.caseId, caseId)).orderBy(desc(proposals.version)).limit(1);
  return p ?? null;
}

export async function activeApproval(db: Executor, proposalId: string) {
  const [a] = await db
    .select()
    .from(approvals)
    .where(and(eq(approvals.proposalId, proposalId), isNull(approvals.invalidatedAt)))
    .orderBy(desc(approvals.createdAt))
    .limit(1);
  return a ?? null;
}

// ── Unmatched transfers ────────────────────────────────────────────────────

/** The business attributes an unmatched transfer to a customer so the customer can resolve it. */
export async function assignCustomer(db: Db, p: { businessId: string; caseId: string; customerId: string; actorUserId?: string }) {
  await db.transaction(async (t) => {
    const c = await lockCase(t, p.caseId);
    if (c.businessId !== p.businessId) throw new ResolutionError("Case not found");
    if (c.kind !== "unmatched" || c.status !== "open") throw new ResolutionError("Only open unmatched payments can be assigned");
    const [cust] = await t.select().from(customers).where(and(eq(customers.id, p.customerId), eq(customers.businessId, p.businessId)));
    if (!cust) throw new ResolutionError("Customer not found");
    await t.update(cases).set({ customerId: cust.id }).where(eq(cases.id, c.id));
    const trs = await t.select({ id: caseTransfers.transferId }).from(caseTransfers).where(eq(caseTransfers.caseId, c.id));
    for (const tr of trs) await t.update(transfers).set({ customerId: cust.id }).where(eq(transfers.id, tr.id));
    await logEvent(t, {
      businessId: c.businessId,
      caseId: c.id,
      customerId: cust.id,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "case.assigned",
      message: `Payment attributed to ${cust.name}`,
    });
  });
}

// ── Resolution links ───────────────────────────────────────────────────────

/** Issues a fresh link (revoking earlier ones) and emails it to the invoice customer. Returns the URL. */
export async function sendResolutionLink(db: Db, p: { businessId: string; caseId: string; actorUserId?: string }): Promise<string> {
  const url = await db.transaction(async (t) => {
    const c = await lockCase(t, p.caseId);
    if (c.businessId !== p.businessId) throw new ResolutionError("Case not found");
    if (!c.customerId) throw new ResolutionError("Attribute this payment to a customer first");
    if (c.status === "resolved") throw new ResolutionError("This case is already resolved");
    const [cust] = await t.select().from(customers).where(eq(customers.id, c.customerId));
    const available = await caseAvailable(t, c.id);

    await t.update(resolutionLinks).set({ revokedAt: new Date() }).where(and(eq(resolutionLinks.caseId, c.id), isNull(resolutionLinks.revokedAt)));
    const token = newToken();
    await t.insert(resolutionLinks).values({
      id: newId("rl"),
      caseId: c.id,
      customerId: cust.id,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + LINK_TTL_MS),
    });
    const url = `${env().APP_URL}/r/${token}`;
    await queueEmail(t, {
      businessId: c.businessId,
      to: cust.email,
      subject: `Let's settle the extra ${formatUsd(available)} you sent`,
      body: `Hi ${cust.name}, we received ${formatUsd(available)} more than your invoice needed. Choose how you'd like it handled — applied to another invoice, kept as credit, or refunded. Nothing moves until we both approve the exact plan.`,
      link: url,
    });
    await logEvent(t, {
      businessId: c.businessId,
      caseId: c.id,
      customerId: cust.id,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "link.sent",
      message: `Resolution link sent to ${cust.email}`,
    });
    return url;
  });
  await deliverOutbox(db);
  return url;
}

/** Resolves a link token. Knowing the link alone doesn't grant access — the customer also verifies by email. */
export async function findLink(db: Executor, token: string) {
  const [link] = await db.select().from(resolutionLinks).where(eq(resolutionLinks.tokenHash, sha256(token)));
  if (!link) return { ok: false as const, reason: "This link isn't valid." };
  if (link.revokedAt) return { ok: false as const, reason: "This link was replaced by a newer one. Check your email for the latest link." };
  if (link.expiresAt < new Date()) return { ok: false as const, reason: "This link has expired. Ask the business to send a new one." };
  return { ok: true as const, link };
}

// ── Proposals ──────────────────────────────────────────────────────────────

export function isValidProof(proof: DestinationProof | null | undefined, caseId: string, destination: string): boolean {
  if (!proof) return false;
  const nonce = proof.message.match(/^Nonce: (.+)$/m)?.[1];
  if (!nonce || proof.message !== destinationProofMessage({ caseId, destination, nonce })) return false;
  return verifyWalletSignature(proof.message, proof.signature, destination);
}

/**
 * The customer submits a plan. Each submission is a new immutable version; any earlier
 * approval is invalidated and the business must approve the new version explicitly.
 */
export async function submitProposal(
  db: Db,
  p: {
    caseId: string;
    customerId: string;
    lines: ProposalLine[];
    refundDestination: string | null;
    destinationProof: DestinationProof | null;
    note?: string;
  },
) {
  return db.transaction(async (t) => {
    const c = await lockCase(t, p.caseId);
    if (c.customerId !== p.customerId) throw new ResolutionError("You can't change this case");
    if (c.status === "executing" || c.status === "resolved") throw new ResolutionError("This plan is already being carried out");

    const available = await caseAvailable(t, c.id);
    const open = (await invoicesWithBalances(t, { businessId: c.businessId, customerId: p.customerId })).filter((i) => i.remaining > 0n);
    const parsed = parseLines(p.lines);
    if (!parsed.ok) throw new ResolutionError(parsed.errors.join(" "));
    const destination = lineAmount(parsed.lines, "refund") > 0n ? p.refundDestination : null;
    const check = validateProposal(
      { lines: parsed.lines, refundDestination: destination },
      { available, openInvoices: open.map((i) => ({ id: i.id, number: i.number, remaining: i.remaining })), isValidDestination: isWalletAddress },
    );
    if (!check.ok) throw new ResolutionError(check.errors.join(" "));
    if (destination && !isValidProof(p.destinationProof, c.id, destination))
      throw new ResolutionError("Confirm the refund wallet by signing with it before submitting.");

    const prev = await latestProposal(t, c.id);
    const version = (prev?.version ?? 0) + 1;
    const lines = canonicalLines(parsed.lines);
    const hash = hashProposal({ caseId: c.id, version, available, lines, refundDestination: destination });
    const proposalId = newId("pr");

    const numberOf = (id: string) => open.find((i) => i.id === id)?.number ?? "invoice";
    const changes = prev ? describeChanges({ lines: prev.lines, refundDestination: prev.refundDestination }, { lines, refundDestination: destination }, numberOf) : [];

    if (prev && (prev.status === "submitted" || prev.status === "approved")) {
      await t.update(proposals).set({ status: "superseded" }).where(eq(proposals.id, prev.id));
      const approval = await activeApproval(t, prev.id);
      if (approval) {
        const reason = `Superseded by v${version}: ${changes.join("; ") || "plan resubmitted"}`;
        await t.update(approvals).set({ invalidatedAt: new Date(), invalidatedReason: reason }).where(eq(approvals.id, approval.id));
        await logEvent(t, {
          businessId: c.businessId,
          caseId: c.id,
          customerId: c.customerId,
          actor: "system",
          type: "approval.invalidated",
          message: `Approval of v${prev.version} no longer applies — ${changes.join("; ") || "plan resubmitted"}. Execution is blocked until v${version} is approved.`,
        });
      }
    }

    await t.insert(proposals).values({
      id: proposalId,
      caseId: c.id,
      version,
      authorKind: "customer",
      authorId: p.customerId,
      lines,
      refundDestination: destination,
      destinationProof: destination ? p.destinationProof : null,
      available,
      hash,
      note: p.note?.trim() || null,
    });
    await t.update(cases).set({ status: "proposed" }).where(eq(cases.id, c.id));
    await logEvent(t, {
      businessId: c.businessId,
      caseId: c.id,
      customerId: c.customerId,
      actor: "customer",
      type: "proposal.submitted",
      message: prev ? `Customer revised the plan (v${version}): ${changes.join("; ") || "no changes"}` : `Customer proposed a plan (v1): ${summarize(lines, numberOf)}`,
      data: { version, hash },
    });
    return { proposalId, version, hash };
  });
}

export function summarize(lines: ProposalLine[], invoiceNumber: (id: string) => string): string {
  return lines
    .map((l) =>
      l.type === "invoice"
        ? `${formatUsd(BigInt(l.amount))} to ${invoiceNumber(l.invoiceId)}`
        : l.type === "credit"
          ? `${formatUsd(BigInt(l.amount))} as credit`
          : `${formatUsd(BigInt(l.amount))} refunded`,
    )
    .join(", ");
}

/**
 * The business declines the current version and tells the customer why. Any approval of
 * it is voided and the case goes back to the customer, who can submit a new version.
 * The business never edits the customer's plan itself: it's the customer's money.
 */
export async function requestChanges(db: Db, p: { businessId: string; caseId: string; proposalId: string; note: string; actorUserId?: string }) {
  const note = p.note.trim();
  if (note.length < 3) throw new ResolutionError("Tell the customer what to change.");
  await db.transaction(async (t) => {
    const c = await lockCase(t, p.caseId);
    if (c.businessId !== p.businessId) throw new ResolutionError("Case not found");
    const latest = await latestProposal(t, c.id);
    if (!latest || latest.id !== p.proposalId) throw new ResolutionError("A newer version of this plan exists. Review it first.");
    if (latest.status !== "submitted" && latest.status !== "approved") throw new ResolutionError(`Version ${latest.version} is already ${latest.status}.`);
    const approval = await activeApproval(t, latest.id);
    if (approval) await t.update(approvals).set({ invalidatedAt: new Date(), invalidatedReason: `Business requested changes: ${note}` }).where(eq(approvals.id, approval.id));
    await t.update(proposals).set({ status: "declined", businessNote: note }).where(eq(proposals.id, latest.id));
    await t.update(cases).set({ status: "open" }).where(eq(cases.id, c.id));
    const [cust] = await t.select().from(customers).where(eq(customers.id, c.customerId!));
    const [biz] = await t.select().from(businesses).where(eq(businesses.id, c.businessId));
    await queueEmail(t, {
      businessId: c.businessId,
      to: cust.email,
      subject: `${biz.name} asked for a change to your plan`,
      body: `${biz.name} reviewed version ${latest.version} and asked: “${note}” Open your resolution link to send a revised plan.`,
    });
    await logEvent(t, {
      businessId: c.businessId,
      caseId: c.id,
      customerId: c.customerId,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "proposal.declined",
      message: `Business asked for changes to v${latest.version}: “${note}”`,
    });
  });
  await deliverOutbox(db);
}

/** The business approves one exact version, bound by its hash. */
export async function approveProposal(db: Db, p: { businessId: string; caseId: string; proposalId: string; approvedBy: string; actorUserId?: string }) {
  await db.transaction(async (t) => {
    const c = await lockCase(t, p.caseId);
    if (c.businessId !== p.businessId) throw new ResolutionError("Case not found");
    const latest = await latestProposal(t, c.id);
    if (!latest || latest.id !== p.proposalId) throw new ResolutionError("A newer version of this plan exists. Review it before approving.");
    if (latest.status !== "submitted") throw new ResolutionError(`Version ${latest.version} is already ${latest.status}`);
    const recomputed = hashProposal({ ...latest, lines: latest.lines });
    if (recomputed !== latest.hash) throw new ResolutionError("Plan integrity check failed");

    await t.insert(approvals).values({ id: newId("ap"), proposalId: latest.id, proposalHash: latest.hash, approvedBy: p.approvedBy });
    await t.update(proposals).set({ status: "approved" }).where(eq(proposals.id, latest.id));
    await t.update(cases).set({ status: "approved" }).where(eq(cases.id, c.id));
    await logEvent(t, {
      businessId: c.businessId,
      caseId: c.id,
      customerId: c.customerId,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "proposal.approved",
      message: `Business approved plan v${latest.version} (${latest.hash.slice(0, 10)})`,
      data: { version: latest.version, hash: latest.hash },
    });
  });
}

/**
 * Carries out the approved plan. Re-checks that the approval still matches the current
 * version, that the excess is unchanged, and that invoices still have room. Allocations
 * and credit post immediately; a refund is reserved in refund_pending until its on-chain
 * transfer confirms.
 */
export async function executePlan(db: Db, p: { businessId: string; caseId: string; actorUserId?: string }): Promise<{ refundId: string | null }> {
  return db.transaction(async (t) => {
    const c = await lockCase(t, p.caseId);
    if (c.businessId !== p.businessId) throw new ResolutionError("Case not found");
    if (c.status !== "approved") throw new ResolutionError("This plan needs an approval for its current version before it can run.");
    const prop = await latestProposal(t, c.id);
    if (!prop || prop.status !== "approved") throw new ResolutionError("The current version isn't approved.");
    const approval = await activeApproval(t, prop.id);
    if (!approval || approval.proposalHash !== prop.hash || hashProposal({ ...prop }) !== prop.hash)
      throw new ResolutionError("The approval doesn't match the current plan.");

    const sources = (await caseSources(t, c.id)).filter((s) => s.unresolved > 0n);
    const available = sources.reduce((a, s) => a + s.unresolved, 0n);
    if (available !== prop.available)
      throw new ResolutionError(`The unresolved amount changed from ${formatUsd(prop.available)} to ${formatUsd(available)}. Ask for a revised plan.`);

    const open = await invoicesWithBalances(t, { businessId: c.businessId, customerId: c.customerId! });
    for (const line of prop.lines) {
      if (line.type !== "invoice") continue;
      const inv = open.find((i) => i.id === line.invoiceId);
      if (!inv || inv.remaining < BigInt(line.amount))
        throw new ResolutionError(`${inv?.number ?? "An invoice"} no longer has room for ${formatUsd(BigInt(line.amount))}. Ask for a revised plan.`);
    }

    const refundAmount = lineAmount(prop.lines, "refund");
    const refundId = refundAmount > 0n ? newId("rf") : null;
    if (refundId) {
      const [biz] = await t.select().from(businesses).where(eq(businesses.id, c.businessId));
      // The refund leaves from the wallet that received the excess (largest source first).
      const largest = [...sources].sort((a, b) => (b.unresolved > a.unresolved ? 1 : -1))[0];
      const [src] = await t.select({ wallet: transfers.walletAddress }).from(transfers).where(eq(transfers.id, largest.transferId));
      await t.insert(refunds).values({
        id: refundId,
        businessId: c.businessId,
        caseId: c.id,
        proposalId: prop.id,
        amount: refundAmount,
        sourceWallet: src?.wallet ?? biz.walletAddress,
        destinationOwner: prop.refundDestination!,
        destinationTokenAccount: ata(biz.mint, prop.refundDestination!).toBase58(),
      });
    }

    // Draw each line from the case's transfers oldest-first so every posting stays traceable.
    const pool = sources.map((s) => ({ transferId: s.transferId, left: s.unresolved }));
    const draw = (amount: bigint, to: PostingDraft["account"], toDims: Partial<PostingDraft>) => {
      const out: PostingDraft[] = [];
      let need = amount;
      for (const src of pool) {
        if (need === 0n) break;
        const take = src.left < need ? src.left : need;
        if (take === 0n) continue;
        src.left -= take;
        need -= take;
        out.push(...move("unresolved", to, take, { transferId: src.transferId, caseId: c.id, customerId: c.customerId }, toDims));
      }
      if (need !== 0n) throw new ResolutionError("Not enough unresolved funds");
      return out;
    };

    const posts: PostingDraft[] = [];
    for (const line of prop.lines) {
      const amount = BigInt(line.amount);
      if (line.type === "invoice") posts.push(...draw(amount, "invoice", { invoiceId: line.invoiceId }));
      if (line.type === "credit") posts.push(...draw(amount, "credit", {}));
      if (line.type === "refund") posts.push(...draw(amount, "refund_pending", { refundId }));
    }
    const numbers = new Map(open.map((i) => [i.id, i.number]));
    await postEntry(t, {
      businessId: c.businessId,
      key: `execute:${prop.id}`,
      kind: "resolution",
      caseId: c.id,
      memo: `Plan v${prop.version}: ${summarize(prop.lines, (id) => numbers.get(id) ?? "invoice")}`,
      postings: posts,
    });

    await t.update(proposals).set({ status: "executed" }).where(eq(proposals.id, prop.id));
    await t
      .update(cases)
      .set(refundId ? { status: "executing" } : { status: "resolved", resolvedAt: new Date() })
      .where(eq(cases.id, c.id));
    await logEvent(t, {
      businessId: c.businessId,
      caseId: c.id,
      customerId: c.customerId,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "plan.executed",
      message: refundId
        ? `Allocations recorded. ${formatUsd(refundAmount)} refund reserved and waiting for the business wallet signature.`
        : "Allocations recorded. Case resolved.",
    });
    for (const line of prop.lines)
      if (line.type === "invoice") await logInvoicePaid(t, { businessId: c.businessId, invoiceId: line.invoiceId, actorUserId: p.actorUserId });
    if (!refundId)
      await logEvent(t, {
        businessId: c.businessId,
        caseId: c.id,
        customerId: c.customerId,
        actor: "business",
        actorUserId: p.actorUserId,
        type: "case.resolved",
        message: `Exception resolved: ${formatUsd(prop.available)} settled as agreed`,
      });
    return { refundId };
  });
}

