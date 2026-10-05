import { and, asc, eq } from "drizzle-orm";
import type { Db, Executor } from "@/lib/db/client";
import { businesses, businessWallets, refunds, transfers } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
import { env } from "@/lib/env";
import { verifyWalletSignature, walletOwnershipMessage, type OwnershipProof } from "@/lib/solana/proof";
import { isWalletAddress, shortAddress } from "@/lib/solana/tx";
import { InputError } from "./invoices";
import { logEvent } from "./journal";

export type WalletRow = { address: string; label: string; active: boolean; createdAt: Date };

/** All receiving wallets, active one first. Ensures the active wallet is always listed. */
export async function listWallets(db: Executor, businessId: string): Promise<WalletRow[]> {
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!biz) return [];
  let rows = await db.select().from(businessWallets).where(eq(businessWallets.businessId, businessId)).orderBy(asc(businessWallets.createdAt));
  if (!rows.some((r) => r.address === biz.walletAddress)) {
    await db
      .insert(businessWallets)
      .values({ id: newId("bw"), businessId, address: biz.walletAddress, label: "Primary wallet" })
      .onConflictDoNothing();
    rows = await db.select().from(businessWallets).where(eq(businessWallets.businessId, businessId)).orderBy(asc(businessWallets.createdAt));
  }
  return rows
    .map((r) => ({ address: r.address, label: r.label, active: r.address === biz.walletAddress, createdAt: r.createdAt }))
    .sort((a, b) => Number(b.active) - Number(a.active));
}

const PROOF_MAX_AGE_MS = 15 * 60 * 1000;

/**
 * Outside demo mode a receiving wallet needs a fresh signature from that wallet. Demo mode
 * also accepts a pasted address, since demo wallets only ever hold test tokens.
 */
export function assertWalletOwnership(address: string, proof: OwnershipProof | undefined) {
  if (!proof) {
    if (env().DEMO_MODE) return;
    throw new InputError("walletProofRequired");
  }
  const issuedAt = proof.message.match(/^Issued: (.+)$/m)?.[1] ?? "";
  const age = Date.now() - Date.parse(issuedAt);
  if (proof.message !== walletOwnershipMessage({ address, issuedAt }) || !(age >= -60_000 && age < PROOF_MAX_AGE_MS))
    throw new InputError("walletProofStale");
  if (!verifyWalletSignature(proof.message, proof.signature, address)) throw new InputError("walletSignatureMismatch");
}

export async function addWallet(db: Db, p: { businessId: string; address: string; label: string; makeActive?: boolean; proof?: OwnershipProof; actorUserId?: string }) {
  const address = p.address.trim();
  if (!isWalletAddress(address)) throw new InputError("invalidWalletAddress");
  assertWalletOwnership(address, p.proof);
  const label = p.label.trim() || `Wallet ${shortAddress(address)}`;
  await listWallets(db, p.businessId);
  const inserted = await db
    .insert(businessWallets)
    .values({ id: newId("bw"), businessId: p.businessId, address, label })
    .onConflictDoNothing()
    .returning();
  if (inserted.length === 0) throw new InputError("walletAlreadyAdded");
  await logEvent(db, { businessId: p.businessId, actor: "business", actorUserId: p.actorUserId, type: "wallet.added", data: { label, address: shortAddress(address) } });
  if (p.makeActive) await setActiveWallet(db, { businessId: p.businessId, address, actorUserId: p.actorUserId });
}

/** New payment links point to the active wallet. Earlier wallets stay watched. */
export async function setActiveWallet(db: Db, p: { businessId: string; address: string; actorUserId?: string }) {
  const [w] = await db.select().from(businessWallets).where(and(eq(businessWallets.businessId, p.businessId), eq(businessWallets.address, p.address)));
  if (!w) throw new InputError("walletAddBeforeActivating");
  await db.update(businesses).set({ walletAddress: w.address }).where(eq(businesses.id, p.businessId));
  await logEvent(db, { businessId: p.businessId, actor: "business", actorUserId: p.actorUserId, type: "wallet.activated", data: { label: w.label, address: shortAddress(w.address) } });
}

/**
 * Removing stops PayFix watching the wallet, so it's refused while the wallet is active,
 * has received payments, or owes a refund — those records must keep reconciling.
 */
export async function removeWallet(db: Db, p: { businessId: string; address: string; actorUserId?: string }) {
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, p.businessId));
  if (biz?.walletAddress === p.address) throw new InputError("walletActiveCantRemove");
  const [used] = await db.select({ id: transfers.id }).from(transfers).where(and(eq(transfers.businessId, p.businessId), eq(transfers.walletAddress, p.address))).limit(1);
  const [owes] = await db.select({ id: refunds.id }).from(refunds).where(and(eq(refunds.businessId, p.businessId), eq(refunds.sourceWallet, p.address))).limit(1);
  if (used || owes) throw new InputError("walletHasPayments");
  const removed = await db.delete(businessWallets).where(and(eq(businessWallets.businessId, p.businessId), eq(businessWallets.address, p.address))).returning();
  if (removed[0])
    await logEvent(db, {
      businessId: p.businessId,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "wallet.removed",
      data: { label: removed[0].label, address: shortAddress(removed[0].address) },
    });
}
