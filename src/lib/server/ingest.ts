import { and, eq, inArray, ne } from "drizzle-orm";
import type { ParsedTransactionWithMeta } from "@solana/web3.js";
import type { Db } from "@/lib/db/client";
import { businesses, caseTransfers, cases, chainSignatures, customers, invoices, paymentRequests, transfers } from "@/lib/db/schema";
import { planIncoming } from "@/lib/domain/allocation";
import { move, receipt } from "@/lib/domain/ledger";
import { newId } from "@/lib/ids";
import { formatUsd } from "@/lib/money";
import { parseTokenMovement } from "@/lib/solana/parse";
import { ata, shortAddress } from "@/lib/solana/tx";
import type { ChainClient } from "./chain";
import { logEvent, postEntry } from "./journal";
import { invoiceWithBalance } from "./queries";
import { listWallets } from "./wallets";

export type Deps = { db: Db; chain: ChainClient };

type Business = typeof businesses.$inferSelect;

/**
 * Pulls recent activity on each of the business's token accounts (every receiving wallet,
 * not just the active one, so older payment links still settle) and ingests anything new.
 * Safe to run concurrently and repeatedly: each signature is claimed once in
 * chain_signatures, transfers are unique per signature, and journal entries are keyed.
 */
export async function syncBusiness(deps: Deps, businessId: string): Promise<{ ingested: number }> {
  const [biz] = await deps.db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!biz) throw new Error("Business not found");
  let ingested = 0;
  for (const w of await listWallets(deps.db, businessId)) ingested += await syncWallet(deps, biz, w.address);
  return { ingested };
}

async function syncWallet(deps: Deps, biz: Business, wallet: string): Promise<number> {
  const businessId = biz.id;
  const tokenAccount = ata(biz.mint, wallet).toBase58();
  const recent = await deps.chain.getSignatures(tokenAccount, 40);
  if (recent.length === 0) return 0;
  const seen = new Set(
    (
      await deps.db
        .select({ s: chainSignatures.signature })
        .from(chainSignatures)
        .where(and(eq(chainSignatures.businessId, businessId), inArray(chainSignatures.signature, recent.map((r) => r.signature))))
    ).map((r) => r.s),
  );

  let ingested = 0;
  for (const sig of [...recent].reverse()) {
    if (seen.has(sig.signature)) continue;
    if (sig.failed) {
      await deps.db.insert(chainSignatures).values({ businessId, signature: sig.signature, relevant: false }).onConflictDoNothing();
      continue;
    }
    const tx = await deps.chain.getParsedTransaction(sig.signature);
    if (!tx) continue; // not visible yet at this commitment; try again next sync
    if (await ingestTransaction(deps.db, biz, wallet, sig.signature, tx)) ingested++;
  }
  return ingested;
}

/** Records one transaction seen on `wallet`'s token account. Returns true if it produced a new transfer. */
export async function ingestTransaction(db: Db, biz: Business, wallet: string, signature: string, tx: ParsedTransactionWithMeta): Promise<boolean> {
  const tokenAccount = ata(biz.mint, wallet).toBase58();
  const movement = parseTokenMovement(tx, { tokenAccount, mint: biz.mint });

  return db.transaction(async (t) => {
    const claimed = await t
      .insert(chainSignatures)
      .values({ businessId: biz.id, signature, relevant: movement !== null })
      .onConflictDoNothing()
      .returning();
    if (claimed.length === 0 || !movement) return false;

    const request = movement.accountKeys.length
      ? (await t.select().from(paymentRequests).where(inArray(paymentRequests.reference, movement.accountKeys)))[0]
      : undefined;
    const invoice = request ? (await t.select().from(invoices).where(eq(invoices.id, request.invoiceId)))[0] : undefined;

    const transferId = newId("tr");
    await t.insert(transfers).values({
      id: transferId,
      businessId: biz.id,
      signature,
      direction: movement.direction,
      mint: biz.mint,
      walletAddress: wallet,
      amount: movement.amount,
      counterpartyOwner: movement.counterpartyOwner,
      counterpartyTokenAccount: movement.counterpartyTokenAccount,
      reference: request?.reference ?? null,
      invoiceId: invoice?.id ?? null,
      customerId: invoice?.customerId ?? null,
      slot: movement.slot,
      blockTime: movement.blockTime,
    });

    // Outgoing movements are refunds (or merchant activity outside PayFix). Refund
    // confirmation is handled by refund reconciliation, keyed by the refund's signature.
    if (movement.direction === "out") {
      await logEvent(t, {
        businessId: biz.id,
        actor: "system",
        type: "transfer.out",
        message: `${formatUsd(movement.amount)} sent to ${shortAddress(movement.counterpartyOwner ?? "unknown")}`,
        data: { signature, memos: movement.memos },
      });
      return true;
    }

    const dims = { transferId, customerId: invoice?.customerId ?? null };
    await postEntry(t, {
      businessId: biz.id,
      key: `receipt:${biz.id}:${signature}`,
      kind: "receipt",
      memo: `Received ${formatUsd(movement.amount)}`,
      postings: receipt(movement.amount, dims),
    });

    if (!invoice) {
      const caseId = newId("case");
      await t.insert(cases).values({ id: caseId, businessId: biz.id, kind: "unmatched" });
      await t.insert(caseTransfers).values({ caseId, transferId });
      await logEvent(t, {
        businessId: biz.id,
        caseId,
        actor: "system",
        type: "transfer.unmatched",
        message: `${formatUsd(movement.amount)} arrived from ${shortAddress(movement.counterpartyOwner ?? "unknown")} without an invoice reference`,
        data: { signature },
      });
      return true;
    }

    const balance = (await invoiceWithBalance(t, invoice.id))!;
    const prior = await t
      .select({ amount: transfers.amount, counterparty: transfers.counterpartyOwner, receivedAt: transfers.blockTime })
      .from(transfers)
      .where(and(eq(transfers.invoiceId, invoice.id), eq(transfers.direction, "in"), ne(transfers.id, transferId)));
    const receivedAt = movement.blockTime ?? new Date();
    const plan = planIncoming({
      amount: movement.amount,
      invoiceAmount: invoice.amount,
      alreadyApplied: balance.applied,
      dueAt: invoice.dueAt,
      receivedAt,
      counterparty: movement.counterpartyOwner,
      priorPayments: prior.map((p) => ({ amount: p.amount, counterparty: p.counterparty, receivedAt: p.receivedAt ?? receivedAt })),
    });

    if (plan.apply > 0n) {
      await postEntry(t, {
        businessId: biz.id,
        key: `apply:${biz.id}:${signature}`,
        kind: "apply",
        memo: `Applied to ${invoice.number}`,
        postings: move("unresolved", "invoice", plan.apply, dims, { invoiceId: invoice.id }),
      });
    }
    if (plan.late) await t.update(transfers).set({ flags: ["late"] }).where(eq(transfers.id, transferId));

    const [customer] = await t.select().from(customers).where(eq(customers.id, invoice.customerId));
    const settled = balance.applied + plan.apply >= invoice.amount;
    await logEvent(t, {
      businessId: biz.id,
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      actor: "system",
      type: "payment.received",
      message: `${customer?.name ?? "Customer"} paid ${formatUsd(movement.amount)} toward ${invoice.number}${
        settled ? " — invoice settled" : ` — ${formatUsd(invoice.amount - balance.applied - plan.apply)} remaining`
      }${plan.late ? " (late)" : ""}`,
      data: { signature, applied: plan.apply.toString(), excess: plan.excess.toString() },
    });

    if (plan.exception) {
      const caseId = newId("case");
      await t.insert(cases).values({ id: caseId, businessId: biz.id, customerId: invoice.customerId, invoiceId: invoice.id, kind: plan.exception });
      await t.insert(caseTransfers).values({ caseId, transferId });
      await logEvent(t, {
        businessId: biz.id,
        caseId,
        invoiceId: invoice.id,
        customerId: invoice.customerId,
        actor: "system",
        type: "case.opened",
        message:
          plan.exception === "duplicate"
            ? `Apparent duplicate: ${formatUsd(plan.excess)} arrived after ${invoice.number} was already settled`
            : `${formatUsd(plan.excess)} over the balance of ${invoice.number} needs resolution`,
        data: { signature, excess: plan.excess.toString() },
      });
    }
    return true;
  });
}
