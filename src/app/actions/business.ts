"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { businesses, cases, refunds } from "@/lib/db/schema";
import { tryToUnits } from "@/lib/money";
import { deps, requireBusiness, resetSeedFlag, syncAll } from "@/lib/server/context";
import { demoSignRefund, faucet, resetDemo } from "@/lib/server/demo";
import { createCustomer, createInvoice, InputError } from "@/lib/server/invoices";
import { prepareRefund, reconcileRefund, submitSignedRefund } from "@/lib/server/refunds";
import { approveProposal, assignCustomer, executePlan, ResolutionError, sendResolutionLink } from "@/lib/server/resolution";
import { env } from "@/lib/env";
import { isWalletAddress } from "@/lib/solana/tx";
import { run } from "./result";

export async function createCustomerAction(input: { name: string; email: string }) {
  return run(async () => {
    const biz = await requireBusiness();
    const { db } = await deps();
    const id = await createCustomer(db, { businessId: biz.id, ...input });
    refresh();
    return { id };
  });
}

export async function createInvoiceAction(input: { customerId: string; title: string; amount: string; dueDate: string }) {
  return run(async () => {
    const biz = await requireBusiness();
    const { db } = await deps();
    const amount = tryToUnits(input.amount);
    if (amount === null) throw new InputError("Enter an amount like 1000 or 49.99.");
    const dueAt = new Date(`${input.dueDate}T23:59:59Z`);
    if (Number.isNaN(dueAt.getTime())) throw new InputError("Choose a due date.");
    return createInvoice(db, { businessId: biz.id, customerId: input.customerId, title: input.title, amount, dueAt });
  });
}

async function ownedCase(caseId: string) {
  const biz = await requireBusiness();
  const { db } = await deps();
  const [c] = await db.select().from(cases).where(and(eq(cases.id, caseId), eq(cases.businessId, biz.id)));
  if (!c) throw new ResolutionError("Case not found");
  return { biz, db, c };
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
    const { biz, db } = await ownedCase(caseId);
    await approveProposal(db, { businessId: biz.id, caseId, proposalId, approvedBy: biz.ownerEmail });
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

export async function prepareRefundAction(refundId: string) {
  return run(async () => {
    const biz = await requireBusiness();
    return prepareRefund(await deps(), { businessId: biz.id, refundId });
  });
}

export async function submitRefundAction(attemptId: string, signedTransaction: string) {
  return run(async () => {
    const biz = await requireBusiness();
    const d = await deps();
    const res = await submitSignedRefund(d, { businessId: biz.id, attemptId, signedTransaction });
    refresh();
    return res;
  });
}

/** Demo mode: sign the prepared refund with the server-held devnet merchant wallet, then submit. */
export async function demoSignRefundAction(refundId: string) {
  return run(async () => {
    const biz = await requireBusiness();
    const d = await deps();
    const { attemptId, transaction } = await prepareRefund(d, { businessId: biz.id, refundId });
    const signed = demoSignRefund(transaction, biz.walletAddress);
    const res = await submitSignedRefund(d, { businessId: biz.id, attemptId, signedTransaction: signed });
    refresh();
    return res;
  });
}

export async function checkRefundAction(refundId: string) {
  return run(async () => {
    const biz = await requireBusiness();
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
    await requireBusiness();
    await syncAll(true);
    refresh();
    return {};
  });
}

export async function updateWalletAction(address: string) {
  return run(async () => {
    const biz = await requireBusiness();
    if (!isWalletAddress(address)) throw new InputError("That isn't a valid wallet address.");
    const { db } = await deps();
    await db.update(businesses).set({ walletAddress: address }).where(eq(businesses.id, biz.id));
    refresh();
    return {};
  });
}

export async function resetDemoAction() {
  return run(async () => {
    if (!env().DEMO_MODE) throw new InputError("Reset is only available in demo mode.");
    await requireBusiness();
    const { db } = await deps();
    await resetDemo(db);
    resetSeedFlag();
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
