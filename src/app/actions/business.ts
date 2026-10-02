"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { cases, refunds } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { tryToUnits } from "@/lib/money";
import type { Role } from "@/lib/roles";
import { isWalletAddress } from "@/lib/solana/tx";
import { applyCredit } from "@/lib/server/credit";
import { currentUser, deps, requireRole, setWorkspaceCookie, syncCompany } from "@/lib/server/context";
import { demoSignRefund, ensureTokenAccount, faucet, provisionDemoWallet } from "@/lib/server/demo";
import { createCustomer, createInvoice, InputError } from "@/lib/server/invoices";
import { prepareRefund, reconcileRefund, submitSignedRefund } from "@/lib/server/refunds";
import { approveProposal, assignCustomer, executePlan, requestChanges, ResolutionError, sendResolutionLink } from "@/lib/server/resolution";
import { addWallet, removeWallet, setActiveWallet } from "@/lib/server/wallets";
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
export async function createWorkspaceAction(input: { name: string; walletAddress?: string; sampleData?: boolean }) {
  const res = await run(async () => {
    const user = await currentUser();
    if (!user) throw new InputError("Sign in first.");
    const { db } = await deps();
    let wallet: { address: string; label: string; secretEnc?: string };
    if (env().DEMO_MODE && !input.walletAddress) {
      const w = await provisionDemoWallet();
      wallet = { address: w.address, label: "Demo merchant wallet", secretEnc: w.secretEnc };
    } else {
      const address = (input.walletAddress ?? "").trim();
      if (!isWalletAddress(address)) throw new InputError("Enter the Solana wallet address payments should go to.");
      wallet = { address, label: "Primary wallet" };
    }
    const businessId = await createWorkspace(db, { userId: user.id, email: user.email, name: input.name, wallet });
    if (input.sampleData) await seedSampleData(db, businessId);
    await setWorkspaceCookie(businessId);
    return {};
  });
  if (res.ok) redirect("/app");
  return res;
}

export async function switchWorkspaceAction(businessId: string) {
  const res = await run(async () => {
    const user = await currentUser();
    if (!user) throw new InputError("Sign in first.");
    const { db } = await deps();
    if (!(await listWorkspaces(db, user.id)).some((w) => w.businessId === businessId)) throw new InputError("You’re not a member of that company.");
    await setWorkspaceCookie(businessId);
    return {};
  });
  if (res.ok) redirect("/app");
  return res;
}

/** Clears this company's demo data (never another company's) and recreates the sample invoices. */
export async function resetWorkspaceAction() {
  return run(async () => {
    if (!env().DEMO_MODE) throw new InputError("Reset is only available in demo mode.");
    const { biz } = await requireRole("owner");
    const { db } = await deps();
    await clearWorkspaceData(db, biz.id);
    await seedSampleData(db, biz.id);
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
    await addMember(db, { businessId: biz.id, email: input.email, role: input.role, invitedBy: user.email });
    refresh();
    return {};
  });
}

export async function setMemberRoleAction(userId: string, role: Role) {
  return run(async () => {
    const { biz } = await requireRole("owner");
    const { db } = await deps();
    await setMemberRole(db, { businessId: biz.id, userId, role });
    refresh();
    return {};
  });
}

export async function removeMemberAction(userId: string) {
  return run(async () => {
    const { biz } = await requireRole("owner");
    const { db } = await deps();
    await removeMember(db, { businessId: biz.id, userId });
    refresh();
    return {};
  });
}

// ── Customers and invoices ─────────────────────────────────────────────────

export async function createCustomerAction(input: { name: string; email: string }) {
  return run(async () => {
    const { biz } = await requireRole("editor");
    const { db } = await deps();
    const id = await createCustomer(db, { businessId: biz.id, ...input });
    refresh();
    return { id };
  });
}

export async function createInvoiceAction(input: { customerId: string; title: string; amount: string; dueDate: string }) {
  return run(async () => {
    const { biz } = await requireRole("editor");
    const { db } = await deps();
    const amount = tryToUnits(input.amount);
    if (amount === null) throw new InputError("Enter an amount like 1000 or 49.99.");
    if (amount > MAX_INVOICE) throw new InputError("Invoices are limited to $1,000,000,000.");
    const dueAt = new Date(`${input.dueDate}T23:59:59Z`);
    if (Number.isNaN(dueAt.getTime())) throw new InputError("Choose a due date.");
    return createInvoice(db, { businessId: biz.id, customerId: input.customerId, title: input.title, amount, dueAt });
  });
}

export async function applyCreditAction(invoiceId: string) {
  return run(async () => {
    const { biz } = await requireRole("editor");
    const { db } = await deps();
    const { applied } = await applyCredit(db, { businessId: biz.id, invoiceId });
    refresh();
    return { applied: applied.toString() };
  });
}

// ── Cases ───────────────────────────────────────────────────────────────────

async function ownedCase(caseId: string) {
  const { biz, user } = await requireRole("editor");
  const { db } = await deps();
  const [c] = await db.select().from(cases).where(and(eq(cases.id, caseId), eq(cases.businessId, biz.id)));
  if (!c) throw new ResolutionError("Case not found");
  return { biz, user, db, c };
}

export async function sendLinkAction(caseId: string) {
  return run(async () => {
    const { biz, db } = await ownedCase(caseId);
    const url = await sendResolutionLink(db, { businessId: biz.id, caseId });
    refresh();
    // In demo mode the presenter needs the link without a real inbox.
    return { url: env().DEMO_MODE ? url : null };
  });
}

export async function assignCustomerAction(caseId: string, customerId: string) {
  return run(async () => {
    const { biz, db } = await ownedCase(caseId);
    await assignCustomer(db, { businessId: biz.id, caseId, customerId });
    refresh();
    return {};
  });
}

export async function approveAction(caseId: string, proposalId: string) {
  return run(async () => {
    const { biz, user, db } = await ownedCase(caseId);
    await approveProposal(db, { businessId: biz.id, caseId, proposalId, approvedBy: user.email });
    refresh();
    return {};
  });
}

export async function requestChangesAction(caseId: string, proposalId: string, note: string) {
  return run(async () => {
    const { biz, db } = await ownedCase(caseId);
    await requestChanges(db, { businessId: biz.id, caseId, proposalId, note });
    refresh();
    return {};
  });
}

export async function executeAction(caseId: string) {
  return run(async () => {
    const { biz, db } = await ownedCase(caseId);
    const res = await executePlan(db, { businessId: biz.id, caseId });
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
    const { biz } = await requireRole("editor");
    const d = await deps();
    const res = await submitSignedRefund(d, { businessId: biz.id, attemptId, signedTransaction });
    refresh();
    return res;
  });
}

/** Demo mode: sign the prepared refund with the company's server-held devnet wallet, then submit. */
export async function demoSignRefundAction(refundId: string) {
  return run(async () => {
    const { biz } = await requireRole("editor");
    const d = await deps();
    const { attemptId, transaction } = await prepareRefund(d, { businessId: biz.id, refundId });
    const [r] = await d.db.select().from(refunds).where(eq(refunds.id, refundId));
    const signed = await demoSignRefund(d.db, { businessId: biz.id, unsignedB64: transaction, walletAddress: r?.sourceWallet ?? biz.walletAddress });
    const res = await submitSignedRefund(d, { businessId: biz.id, attemptId, signedTransaction: signed });
    refresh();
    return res;
  });
}

export async function checkRefundAction(refundId: string) {
  return run(async () => {
    const { biz } = await requireRole("viewer");
    const d = await deps();
    const [r] = await d.db.select().from(refunds).where(and(eq(refunds.id, refundId), eq(refunds.businessId, biz.id)));
    if (!r) throw new ResolutionError("Refund not found");
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

// ── Wallets ─────────────────────────────────────────────────────────────────

export async function addWalletAction(input: { address: string; label: string; makeActive: boolean }) {
  return run(async () => {
    const { biz } = await requireRole("owner");
    const { db } = await deps();
    await addWallet(db, { businessId: biz.id, ...input });
    // In demo mode, open the wallet's test-token account now so payments can land immediately.
    if (env().DEMO_MODE) await ensureTokenAccount(input.address.trim()).catch(() => undefined);
    refresh();
    return {};
  });
}

export async function setActiveWalletAction(address: string) {
  return run(async () => {
    const { biz } = await requireRole("owner");
    const { db } = await deps();
    await setActiveWallet(db, { businessId: biz.id, address });
    refresh();
    return {};
  });
}

export async function removeWalletAction(address: string) {
  return run(async () => {
    const { biz } = await requireRole("owner");
    const { db } = await deps();
    await removeWallet(db, { businessId: biz.id, address });
    refresh();
    return {};
  });
}

export async function faucetAction(address: string) {
  return run(async () => {
    if (!env().DEMO_MODE) throw new InputError("The faucet is only available in demo mode.");
    if (!isWalletAddress(address)) throw new InputError("That isn't a valid wallet address.");
    return { signature: await faucet(address) };
  });
}
