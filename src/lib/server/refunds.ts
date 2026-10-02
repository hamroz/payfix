import bs58 from "bs58";
import { and, desc, eq, inArray } from "drizzle-orm";
import { PublicKey, Transaction } from "@solana/web3.js";
import type { Db } from "@/lib/db/client";
import { businesses, cases, refundAttempts, refunds } from "@/lib/db/schema";
import { move } from "@/lib/domain/ledger";
import { env } from "@/lib/env";
import { newId } from "@/lib/ids";
import { formatUsd } from "@/lib/money";
import { buildRefundTransaction, shortAddress } from "@/lib/solana/tx";
import type { ChainClient } from "./chain";
import { logEvent, postEntry } from "./journal";
import { ResolutionError } from "./resolution";

type Deps = { db: Db; chain: ChainClient };

const toB64 = (b: Uint8Array) => Buffer.from(b).toString("base64");

async function loadRefund(db: Db, refundId: string, businessId: string) {
  const [refund] = await db.select().from(refunds).where(and(eq(refunds.id, refundId), eq(refunds.businessId, businessId)));
  if (!refund) throw new ResolutionError("Refund not found");
  return refund;
}

/**
 * Prepares the exact transaction the merchant wallet will sign. Only one attempt can be
 * live at a time: while an attempt is submitted and its blockhash is still valid, a new
 * one is refused, because the first could still land.
 */
export async function prepareRefund(deps: Deps, p: { businessId: string; refundId: string }) {
  await reconcileRefund(deps, p.refundId);
  const refund = await loadRefund(deps.db, p.refundId, p.businessId);
  if (refund.status === "confirmed") throw new ResolutionError("This refund is already confirmed.");
  if (refund.status === "submitted") throw new ResolutionError("A refund transaction is already in flight. Wait for it to confirm or expire.");

  const [active] = await deps.db
    .select()
    .from(refundAttempts)
    .where(and(eq(refundAttempts.refundId, refund.id), eq(refundAttempts.status, "prepared")));
  const height = await deps.chain.getBlockHeight();
  if (active && active.lastValidBlockHeight > height) {
    return { attemptId: active.id, transaction: await unsignedFromMessage(active.message) };
  }
  if (active) await deps.db.update(refundAttempts).set({ status: "expired", updatedAt: new Date() }).where(eq(refundAttempts.id, active.id));

  const [biz] = await deps.db.select().from(businesses).where(eq(businesses.id, refund.businessId));
  const { blockhash, lastValidBlockHeight } = await deps.chain.getLatestBlockhash();
  const tx = buildRefundTransaction({
    merchant: new PublicKey(refund.sourceWallet ?? biz.walletAddress),
    destination: new PublicKey(refund.destinationOwner),
    mint: new PublicKey(biz.mint),
    decimals: env().PAYFIX_MINT_DECIMALS,
    amount: refund.amount,
    refundId: refund.id,
    blockhash,
    lastValidBlockHeight,
  });
  const message = toB64(tx.serializeMessage());
  const attemptId = newId("ra");
  // The partial unique index rejects a second live attempt even under concurrent requests.
  await deps.db.insert(refundAttempts).values({ id: attemptId, refundId: refund.id, message, blockhash, lastValidBlockHeight });
  return { attemptId, transaction: toB64(tx.serialize({ requireAllSignatures: false, verifySignatures: false })) };
}

async function unsignedFromMessage(messageB64: string) {
  const { Message } = await import("@solana/web3.js");
  const tx = Transaction.populate(Message.from(Buffer.from(messageB64, "base64")));
  return toB64(tx.serialize({ requireAllSignatures: false, verifySignatures: false }));
}

/**
 * Accepts the wallet-signed transaction, checks it is byte-for-byte the prepared one,
 * records its signature *before* broadcasting, then broadcasts.
 */
export async function submitSignedRefund(deps: Deps, p: { businessId: string; attemptId: string; signedTransaction: string }) {
  const [attempt] = await deps.db.select().from(refundAttempts).where(eq(refundAttempts.id, p.attemptId));
  if (!attempt) throw new ResolutionError("Refund attempt not found");
  const refund = await loadRefund(deps.db, attempt.refundId, p.businessId);
  if (attempt.status !== "prepared") throw new ResolutionError(`This attempt is already ${attempt.status}.`);

  const bytes = Buffer.from(p.signedTransaction, "base64");
  const tx = Transaction.from(bytes);
  if (toB64(tx.serializeMessage()) !== attempt.message) throw new ResolutionError("The signed transaction doesn't match the prepared refund.");
  if (!tx.signature || !tx.verifySignatures()) throw new ResolutionError("The transaction isn't signed by the business wallet.");
  const signature = bs58.encode(tx.signature);

  const claimed = await deps.db.transaction(async (t) => {
    const updated = await t
      .update(refundAttempts)
      .set({ status: "submitted", signature, updatedAt: new Date() })
      .where(and(eq(refundAttempts.id, attempt.id), eq(refundAttempts.status, "prepared")))
      .returning();
    if (updated.length === 0) return false;
    await t.update(refunds).set({ status: "submitted", signature }).where(eq(refunds.id, refund.id));
    await logEvent(t, {
      businessId: refund.businessId,
      caseId: refund.caseId,
      actor: "business",
      type: "refund.submitted",
      message: `Business signed the ${formatUsd(refund.amount)} refund to ${shortAddress(refund.destinationOwner)}`,
      data: { signature },
    });
    return true;
  });
  if (!claimed) throw new ResolutionError("This attempt was already submitted.");

  try {
    await deps.chain.sendRawTransaction(bytes);
  } catch (err) {
    // Preflight rejected it, so it can't land. Anything else is ambiguous and left to reconciliation.
    const msg = err instanceof Error ? err.message : String(err);
    if (/simulation failed|insufficient|custom program error/i.test(msg)) {
      await markFailed(deps.db, refund, attempt.id, msg);
      throw new ResolutionError(`The network rejected the refund: ${msg.slice(0, 160)}`);
    }
  }
  return { signature };
}

async function markFailed(db: Db, refund: typeof refunds.$inferSelect, attemptId: string, error: string) {
  await db.transaction(async (t) => {
    await t.update(refundAttempts).set({ status: "failed", error, updatedAt: new Date() }).where(eq(refundAttempts.id, attemptId));
    await t.update(refunds).set({ status: "failed", signature: null }).where(eq(refunds.id, refund.id));
    await logEvent(t, {
      businessId: refund.businessId,
      caseId: refund.caseId,
      actor: "system",
      type: "refund.failed",
      message: `Refund transaction failed and did not move funds. It can be retried.`,
      data: { error: error.slice(0, 300) },
    });
  });
}

/**
 * Settles the state of a submitted refund against the chain. Confirmed → the reserved
 * amount moves to `refunded` (once, by key). Failed → retry allowed. Unknown after the
 * blockhash expired → it can no longer land, so retry is safe.
 */
export async function reconcileRefund(deps: Deps, refundId: string) {
  const [refund] = await deps.db.select().from(refunds).where(eq(refunds.id, refundId));
  if (!refund || refund.status !== "submitted") return refund?.status ?? null;
  const [attempt] = await deps.db
    .select()
    .from(refundAttempts)
    .where(and(eq(refundAttempts.refundId, refund.id), eq(refundAttempts.status, "submitted")))
    .orderBy(desc(refundAttempts.createdAt))
    .limit(1);
  if (!attempt?.signature) return refund.status;

  const status = await deps.chain.getSignatureStatus(attempt.signature);
  if (status?.err) {
    await markFailed(deps.db, refund, attempt.id, JSON.stringify(status.err));
    return "failed";
  }
  if (status?.confirmed) {
    await deps.db.transaction(async (t) => {
      await t.update(refundAttempts).set({ status: "confirmed", updatedAt: new Date() }).where(eq(refundAttempts.id, attempt.id));
      await t.update(refunds).set({ status: "confirmed", confirmedAt: new Date() }).where(eq(refunds.id, refund.id));
      const posted = await postEntry(t, {
        businessId: refund.businessId,
        key: `refund-confirmed:${refund.id}`,
        kind: "refund",
        caseId: refund.caseId,
        memo: `Refund of ${formatUsd(refund.amount)} confirmed`,
        postings: move("refund_pending", "refunded", refund.amount, { refundId: refund.id, caseId: refund.caseId }),
      });
      if (posted) {
        await t.update(cases).set({ status: "resolved", resolvedAt: new Date() }).where(eq(cases.id, refund.caseId));
        await logEvent(t, {
          businessId: refund.businessId,
          caseId: refund.caseId,
          actor: "system",
          type: "refund.confirmed",
          message: `Refund of ${formatUsd(refund.amount)} confirmed on chain. Case resolved.`,
          data: { signature: attempt.signature },
        });
      }
    });
    return "confirmed";
  }
  if (!status) {
    const height = await deps.chain.getBlockHeight();
    if (height > attempt.lastValidBlockHeight) {
      await deps.db.transaction(async (t) => {
        await t.update(refundAttempts).set({ status: "expired", updatedAt: new Date() }).where(eq(refundAttempts.id, attempt.id));
        await t.update(refunds).set({ status: "awaiting_signature", signature: null }).where(eq(refunds.id, refund.id));
        await logEvent(t, {
          businessId: refund.businessId,
          caseId: refund.caseId,
          actor: "system",
          type: "refund.expired",
          message: "The refund transaction expired without landing. No funds moved; it's safe to sign again.",
        });
      });
      return "awaiting_signature";
    }
  }
  return "submitted";
}

export async function reconcileBusinessRefunds(deps: Deps, businessId: string) {
  const pending = await deps.db
    .select({ id: refunds.id })
    .from(refunds)
    .where(and(eq(refunds.businessId, businessId), inArray(refunds.status, ["submitted"])));
  for (const r of pending) await reconcileRefund(deps, r.id);
}
