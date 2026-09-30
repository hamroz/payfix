"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { cases, type DestinationProof, type ProposalLine } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { newToken } from "@/lib/ids";
import { tryToUnits } from "@/lib/money";
import { destinationProofMessage } from "@/lib/solana/proof";
import { isWalletAddress } from "@/lib/solana/tx";
import { currentCustomerId, deps, syncAll } from "@/lib/server/context";
import { demoDestinationProof, demoPay } from "@/lib/server/demo";
import { createPaymentRequest, InputError } from "@/lib/server/invoices";
import { findLink, ResolutionError, submitProposal } from "@/lib/server/resolution";
import { run } from "./result";

/**
 * Payment links are capability URLs (the invoice id is unguessable), like hosted
 * invoice links elsewhere. They can only pay the business — never move money out.
 */
export async function createPaymentRequestAction(invoiceId: string, amount: string | null) {
  return run(async () => {
    const { db } = await deps();
    const units = amount === null || amount === "" ? null : tryToUnits(amount);
    if (amount && units === null) throw new InputError("Enter an amount like 400 or 49.99.");
    return createPaymentRequest(db, { invoiceId, amount: units });
  });
}

export async function demoPayAction(invoiceId: string, amount: string) {
  return run(async () => {
    if (!env().DEMO_MODE) throw new InputError("Demo payments are only available in demo mode.");
    const units = tryToUnits(amount);
    if (units === null || units <= 0n) throw new InputError("Enter an amount like 400 or 49.99.");
    const { db } = await deps();
    const res = await demoPay(db, { invoiceId, amount: units });
    await syncAll(true);
    refresh();
    return res;
  });
}

/** Every customer action re-checks that the session belongs to the customer the link was issued to. */
async function authorizedCase(token: string) {
  const { db } = await deps();
  const found = await findLink(db, token);
  if (!found.ok) throw new ResolutionError(found.reason);
  const customerId = await currentCustomerId();
  if (customerId !== found.link.customerId) throw new ResolutionError("Verify your email to continue.");
  const [c] = await db.select().from(cases).where(eq(cases.id, found.link.caseId));
  return { db, c, customerId };
}

/** A fresh message for the customer's wallet to sign, proving it controls the refund destination. */
export async function destinationChallengeAction(token: string, destination: string) {
  return run(async () => {
    const { c } = await authorizedCase(token);
    if (!isWalletAddress(destination)) throw new InputError("That isn't a valid Solana wallet address.");
    return { message: destinationProofMessage({ caseId: c.id, destination, nonce: newToken().slice(0, 16) }) };
  });
}

export async function demoProofAction(token: string, which: "primary" | "alternate") {
  return run(async () => {
    if (!env().DEMO_MODE) throw new InputError("Demo wallets are only available in demo mode.");
    const { c } = await authorizedCase(token);
    return demoDestinationProof(c.id, which);
  });
}

export async function submitProposalAction(
  token: string,
  input: { lines: ProposalLine[]; refundDestination: string | null; destinationProof: DestinationProof | null; note?: string },
) {
  return run(async () => {
    const { db, c, customerId } = await authorizedCase(token);
    const res = await submitProposal(db, { caseId: c.id, customerId, ...input });
    refresh();
    return res;
  });
}
