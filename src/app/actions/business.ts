"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { businessWallets, cases, refunds } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getI18n } from "@/lib/i18n/server";
import { toUnits, tryToUnits } from "@/lib/money";
import type { Role } from "@/lib/roles";
import { isWalletAddress } from "@/lib/solana/tx";
import { applyCredit } from "@/lib/server/credit";
import { clientIp, currentUser, deps, requireRole, setWorkspaceCookie, syncCompany } from "@/lib/server/context";
import { demoSignRefund, ensureTokenAccount, faucet, provisionDemoWallet, tokenBalance } from "@/lib/server/demo";
import { createCustomer, createInvoice, InputError } from "@/lib/server/invoices";
import { consume, DAY, HOUR, MINUTE, rateKey } from "@/lib/server/ratelimit";
import { prepareRefund, reconcileRefund, submitSignedRefund } from "@/lib/server/refunds";
import { approveProposal, assignCustomer, executePlan, requestChanges, ResolutionError, sendResolutionLink } from "@/lib/server/resolution";
import { markAllRead, markRead, setMuted } from "@/lib/server/notifications";
import { addWallet, assertWalletOwnership, removeWallet, setActiveWallet } from "@/lib/server/wallets";
import type { OwnershipProof } from "@/lib/solana/proof";
import {
  addMember,
  clearWorkspaceData,
  createWorkspace,
  listWorkspaces,
  markHistorySeen,
  removeMember,
  seedSampleData,
  setMemberRole,
} from "@/lib/server/workspaces";
import { chain } from "@/lib/server/chain";
import { ata } from "@/lib/solana/tx";
import { run } from "./result";

/** Largest invoice PayFix accepts: well inside the token program's u64 limit. */
const MAX_INVOICE = tryToUnits("1000000000")!;

// ── Workspaces ──────────────────────────────────────────────────────────────

/**
 * Creates a company with the signed-in user as owner. In demo mode it gets its own
 * server-held devnet wallet and, optionally, the demo script's sample customers and invoices.
 */
export async function createWorkspaceAction(input: { name: string; walletAddress?: string; walletProof?: OwnershipProof; sampleData?: boolean }) {
  const res = await run(async () => {
    const user = await currentUser();
    if (!user) throw new InputError("signInFirst");
    const { db } = await deps();
    let wallet: { address: string; label: string; secretEnc?: string };
    if (env().DEMO_MODE && !input.walletAddress) {
      // Each demo wallet costs the treasury devnet SOL, so creation is limited.
      await consume(db, [
        { key: rateKey("demo-company", user.id), max: 5, windowMs: DAY, error: "rateDemoCompanies" },
        { key: "demo-company:global", max: 60, windowMs: HOUR, error: "rateDemoCompaniesGlobal" },
      ]);
      const w = await provisionDemoWallet();
      wallet = { address: w.address, label: "Demo merchant wallet", secretEnc: w.secretEnc };
    } else {
      const address = (input.walletAddress ?? "").trim();
      if (!isWalletAddress(address)) throw new InputError("receivingWalletRequired");
      assertWalletOwnership(address, input.walletProof);
      wallet = { address, label: "Primary wallet" };
    }
    const businessId = await createWorkspace(db, { userId: user.id, email: user.email, name: input.name, wallet });
    if (input.sampleData) await seedSampleData(db, businessId, user.id);
    await setWorkspaceCookie(businessId);
    return {};
  });
  if (res.ok) redirect("/app");
  return res;
}

export async function switchWorkspaceAction(businessId: string) {
  const res = await run(async () => {
    const user = await currentUser();
    if (!user) throw new InputError("signInFirst");
    const { db } = await deps();
    if (!(await listWorkspaces(db, user.id)).some((w) => w.businessId === businessId)) throw new InputError("notMemberOfThatCompany");
    await setWorkspaceCookie(businessId);
    return {};
  });
  if (res.ok) redirect("/app");
  return res;
}

/** Clears this company's demo data (never another company's) and recreates the sample invoices. */
export async function resetWorkspaceAction() {
  return run(async () => {
    if (!env().DEMO_MODE) throw new InputError("resetDemoOnly");
    const { biz, user } = await requireRole("owner");
    const { db } = await deps();
    await clearWorkspaceData(db, biz.id);
    await seedSampleData(db, biz.id, user.id);
    const sigs = await chain().getSignatures(ata(biz.mint, biz.walletAddress).toBase58(), 500).catch(() => []);
    await markHistorySeen(db, biz.id, sigs.map((s) => s.signature));
    refresh();
    return {};
  });
}

// ── Team ────────────────────────────────────────────────────────────────────

export async function addMemberAction(input: { email: string; role: Role }) {
  return run(async () => {
    const { biz, user } = await requireRole("owner");
    const { db } = await deps();
    const { locale } = await getI18n();
    await addMember(db, { businessId: biz.id, email: input.email, role: input.role, invitedBy: user.email, actorUserId: user.id, locale });
    refresh();
    return {};
  });
}

export async function setMemberRoleAction(userId: string, role: Role) {
  return run(async () => {
    const { biz, user } = await requireRole("owner");
    const { db } = await deps();
    await setMemberRole(db, { businessId: biz.id, userId, role, actorUserId: user.id });
    refresh();
    return {};
  });
}

export async function removeMemberAction(userId: string) {
  return run(async () => {
    const { biz, user } = await requireRole("owner");
    const { db } = await deps();
    await removeMember(db, { businessId: biz.id, userId, actorUserId: user.id });
    refresh();
    return {};
  });
}

// ── Customers and invoices ─────────────────────────────────────────────────

export async function createCustomerAction(input: { name: string; email: string }) {
  return run(async () => {
    const { biz, user } = await requireRole("editor");
    const { db } = await deps();
    const id = await createCustomer(db, { businessId: biz.id, ...input, actorUserId: user.id });
    refresh();
    return { id };
  });
}

export async function createInvoiceAction(input: { customerId: string; title: string; amount: string; dueDate: string }) {
  return run(async () => {
    const { biz, user } = await requireRole("editor");
    const { db } = await deps();
    const amount = tryToUnits(input.amount);
    if (amount === null) throw new InputError("invoiceAmountFormat");
    if (amount > MAX_INVOICE) throw new InputError("invoiceAmountMax");
    const dueAt = new Date(`${input.dueDate}T23:59:59Z`);
    if (Number.isNaN(dueAt.getTime())) throw new InputError("dueDateRequired");
    return createInvoice(db, { businessId: biz.id, customerId: input.customerId, title: input.title, amount, dueAt, actorUserId: user.id });
  });
}

export async function applyCreditAction(invoiceId: string) {
  return run(async () => {
    const { biz, user } = await requireRole("editor");
    const { db } = await deps();
    const { applied } = await applyCredit(db, { businessId: biz.id, invoiceId, actorUserId: user.id });
    refresh();
    return { applied: applied.toString() };
  });
}

// ── Cases ───────────────────────────────────────────────────────────────────

async function ownedCase(caseId: string) {
  const { biz, user } = await requireRole("editor");
  const { db } = await deps();
  const [c] = await db.select().from(cases).where(and(eq(cases.id, caseId), eq(cases.businessId, biz.id)));
  if (!c) throw new ResolutionError("caseNotFound");
  return { biz, user, db, c };
}

export async function sendLinkAction(caseId: string) {
  return run(async () => {
    const { biz, user, db } = await ownedCase(caseId);
    const { locale } = await getI18n();
    const url = await sendResolutionLink(db, { businessId: biz.id, caseId, actorUserId: user.id, locale });
    refresh();
    // In demo mode the presenter needs the link without a real inbox.
    return { url: env().DEMO_MODE ? url : null };
  });
}

export async function assignCustomerAction(caseId: string, customerId: string) {
  return run(async () => {
    const { biz, user, db } = await ownedCase(caseId);
    await assignCustomer(db, { businessId: biz.id, caseId, customerId, actorUserId: user.id });
    refresh();
    return {};
  });
}

export async function approveAction(caseId: string, proposalId: string) {
  return run(async () => {
    const { biz, user, db } = await ownedCase(caseId);
    await approveProposal(db, { businessId: biz.id, caseId, proposalId, approvedBy: user.email, actorUserId: user.id });
    refresh();
    return {};
  });
}

export async function requestChangesAction(caseId: string, proposalId: string, note: string) {
  return run(async () => {
    const { biz, user, db } = await ownedCase(caseId);
    const { locale } = await getI18n();
    await requestChanges(db, { businessId: biz.id, caseId, proposalId, note, actorUserId: user.id, locale });
    refresh();
    return {};
  });
}

export async function executeAction(caseId: string) {
  return run(async () => {
    const { biz, user, db } = await ownedCase(caseId);
    const res = await executePlan(db, { businessId: biz.id, caseId, actorUserId: user.id });
    refresh();
    return res;
  });
}

// ── Refunds ─────────────────────────────────────────────────────────────────

export async function prepareRefundAction(refundId: string) {
  return run(async () => {
    const { biz } = await requireRole("editor");
    return prepareRefund(await deps(), { businessId: biz.id, refundId });
  });
}

export async function submitRefundAction(attemptId: string, signedTransaction: string) {
  return run(async () => {
    const { biz, user } = await requireRole("editor");
    const d = await deps();
    const res = await submitSignedRefund(d, { businessId: biz.id, attemptId, signedTransaction, actorUserId: user.id });
    refresh();
    return res;
  });
}

/** Demo mode: sign the prepared refund with the company's server-held devnet wallet, then submit. */
export async function demoSignRefundAction(refundId: string) {
  return run(async () => {
    const { biz, user } = await requireRole("editor");
    const d = await deps();
    const { attemptId, transaction } = await prepareRefund(d, { businessId: biz.id, refundId });
    const [r] = await d.db.select().from(refunds).where(eq(refunds.id, refundId));
    const signed = await demoSignRefund(d.db, { businessId: biz.id, unsignedB64: transaction, walletAddress: r?.sourceWallet ?? biz.walletAddress });
    const res = await submitSignedRefund(d, { businessId: biz.id, attemptId, signedTransaction: signed, actorUserId: user.id });
    refresh();
    return res;
  });
}

export async function checkRefundAction(refundId: string) {
  return run(async () => {
    const { biz } = await requireRole("viewer");
    const d = await deps();
    const [r] = await d.db.select().from(refunds).where(and(eq(refunds.id, refundId), eq(refunds.businessId, biz.id)));
    if (!r) throw new ResolutionError("refundNotFound");
    const status = await reconcileRefund(d, refundId);
    if (status === "confirmed") refresh();
    return { status };
  });
}

export async function syncNowAction() {
  return run(async () => {
    const { biz } = await requireRole("viewer");
    await syncCompany(biz.id, true);
    refresh();
    return {};
  });
}

// ── Notifications ───────────────────────────────────────────────────────────
// Every role may use these: they only change the signed-in member's own read state and preferences.

export async function markNotificationReadAction(eventId: string) {
  return run(async () => {
    const { biz, user } = await requireRole("viewer");
    const { db } = await deps();
    await markRead(db, { businessId: biz.id, userId: user.id, eventId });
    refresh();
    return {};
  });
}

export async function markAllNotificationsReadAction() {
  return run(async () => {
    const { biz, user } = await requireRole("viewer");
    const { db } = await deps();
    await markAllRead(db, { businessId: biz.id, userId: user.id });
    refresh();
    return {};
  });
}

export async function setNotificationPrefsAction(muted: string[]) {
  return run(async () => {
    const { biz, user } = await requireRole("viewer");
    const { db } = await deps();
    if (!Array.isArray(muted) || muted.some((m) => typeof m !== "string")) throw new InputError("chooseNotificationCategories");
    await setMuted(db, { businessId: biz.id, userId: user.id, muted });
    refresh();
    return {};
  });
}

// ── Wallets ─────────────────────────────────────────────────────────────────

export async function addWalletAction(input: { address: string; label: string; makeActive: boolean; proof?: OwnershipProof }) {
  return run(async () => {
    const { biz, user } = await requireRole("owner");
    const { db } = await deps();
    await addWallet(db, { businessId: biz.id, ...input, actorUserId: user.id });
    // In demo mode, open the wallet's test-token account now so payments can land immediately.
    if (env().DEMO_MODE) await ensureTokenAccount(input.address.trim()).catch(() => undefined);
    refresh();
    return {};
  });
}

export async function setActiveWalletAction(address: string) {
  return run(async () => {
    const { biz, user } = await requireRole("owner");
    const { db } = await deps();
    await setActiveWallet(db, { businessId: biz.id, address, actorUserId: user.id });
    refresh();
    return {};
  });
}

export async function removeWalletAction(address: string) {
  return run(async () => {
    const { biz, user } = await requireRole("owner");
    const { db } = await deps();
    await removeWallet(db, { businessId: biz.id, address, actorUserId: user.id });
    refresh();
    return {};
  });
}

/**
 * Devnet faucet: 2,000 test USD (plus a little SOL for fees when the wallet has none).
 * Public, so it's limited per wallet, per network, and overall to protect the treasury.
 */
export async function faucetAction(address: string) {
  return run(async () => {
    if (!env().DEMO_MODE) throw new InputError("faucetDemoOnly");
    address = address.trim();
    if (!isWalletAddress(address)) throw new InputError("invalidWalletAddress");
    const { db } = await deps();
    // Test USD minted straight into a receiving wallet would show up as an unmatched payment.
    const [receiving] = await db.select({ id: businessWallets.id }).from(businessWallets).where(eq(businessWallets.address, address)).limit(1);
    if (receiving) throw new InputError("faucetReceivingWallet");
    if ((await tokenBalance(address)) >= toUnits("10000")) throw new InputError("faucetPlenty");
    await consume(db, [
      { key: rateKey("faucet", address), max: 1, windowMs: 10 * MINUTE, error: "rateFaucetWallet" },
      { key: rateKey("faucet-day", address), max: 5, windowMs: DAY, error: "rateFaucetWalletDay" },
      { key: rateKey("faucet-ip", await clientIp()), max: 10, windowMs: HOUR, error: "rateFaucetNetwork" },
      { key: "faucet:global", max: 120, windowMs: HOUR, error: "rateFaucetGlobal" },
    ]);
    return { signature: await faucet(address) };
  });
}
