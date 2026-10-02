import { and, asc, eq } from "drizzle-orm";
import type { Db, Executor } from "@/lib/db/client";
import { businesses, businessWallets, refunds, transfers } from "@/lib/db/schema";
import { newId } from "@/lib/ids";
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

export async function addWallet(db: Db, p: { businessId: string; address: string; label: string; makeActive?: boolean }) {
  const address = p.address.trim();
  if (!isWalletAddress(address)) throw new InputError("That isn't a valid Solana wallet address.");
  const label = p.label.trim() || `Wallet ${shortAddress(address)}`;
  await listWallets(db, p.businessId);
  const inserted = await db
    .insert(businessWallets)
    .values({ id: newId("bw"), businessId: p.businessId, address, label })
    .onConflictDoNothing()
    .returning();
  if (inserted.length === 0) throw new InputError("That wallet is already added.");
  await logEvent(db, { businessId: p.businessId, actor: "business", type: "wallet.added", message: `Receiving wallet added: ${label} (${shortAddress(address)})` });
  if (p.makeActive) await setActiveWallet(db, { businessId: p.businessId, address });
}

/** New payment links point to the active wallet. Earlier wallets stay watched. */
export async function setActiveWallet(db: Db, p: { businessId: string; address: string }) {
  const [w] = await db.select().from(businessWallets).where(and(eq(businessWallets.businessId, p.businessId), eq(businessWallets.address, p.address)));
  if (!w) throw new InputError("Add the wallet before making it active.");
  await db.update(businesses).set({ walletAddress: w.address }).where(eq(businesses.id, p.businessId));
  await logEvent(db, { businessId: p.businessId, actor: "business", type: "wallet.activated", message: `New payments now go to ${w.label} (${shortAddress(w.address)})` });
}

/**
 * Removing stops PayFix watching the wallet, so it's refused while the wallet is active,
 * has received payments, or owes a refund — those records must keep reconciling.
 */
export async function removeWallet(db: Db, p: { businessId: string; address: string }) {
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, p.businessId));
  if (biz?.walletAddress === p.address) throw new InputError("Make another wallet active before removing this one.");
  const [used] = await db.select({ id: transfers.id }).from(transfers).where(and(eq(transfers.businessId, p.businessId), eq(transfers.walletAddress, p.address))).limit(1);
  const [owes] = await db.select({ id: refunds.id }).from(refunds).where(and(eq(refunds.businessId, p.businessId), eq(refunds.sourceWallet, p.address))).limit(1);
  if (used || owes) throw new InputError("This wallet has received payments, so PayFix keeps watching it. It can’t be removed.");
  await db.delete(businessWallets).where(and(eq(businessWallets.businessId, p.businessId), eq(businessWallets.address, p.address)));
}
