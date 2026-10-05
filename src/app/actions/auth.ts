"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { endSession, sendCode, verifyCode } from "@/lib/server/auth";
import { clientIp, COOKIES, deps, setDemoInboxCookie, setSessionCookie } from "@/lib/server/context";
import { consume, HOUR, rateKey } from "@/lib/server/ratelimit";
import { InputError } from "@/lib/server/invoices";
import { findOrCreateUser } from "@/lib/server/workspaces";
import { findLink } from "@/lib/server/resolution";
import { customerById } from "@/lib/server/queries";
import { logEvent } from "@/lib/server/journal";
import { cases } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { run } from "./result";

/** Sign in or sign up: the same email code either way. New users create a company next. */
const ipLimit = (ip: string) => ({ key: rateKey("code-ip", ip), max: 30, windowMs: HOUR, message: "Too many sign-in attempts from this network. Try again in an hour." });

export async function requestBusinessCode(email: string) {
  return run(async () => {
    const { db } = await deps();
    await consume(db, [ipLimit(await clientIp())]);
    const user = await findOrCreateUser(db, email);
    const { maskedEmail } = await sendCode(db, { purpose: "business", subjectId: user.id, email: user.email });
    if (env().DEMO_MODE) await setDemoInboxCookie(user.email);
    return { maskedEmail, sent: true };
  });
}

export async function verifyBusinessCode(email: string, code: string) {
  const res = await run(async () => {
    const { db } = await deps();
    const user = await findOrCreateUser(db, email);
    const out = await verifyCode(db, { purpose: "business", subjectId: user.id, code });
    if (!out.ok) throw new InputError(out.error);
    await setSessionCookie("business", out.token, out.expiresAt);
    return {};
  });
  if (res.ok) redirect("/app");
  return res;
}

export async function signOut() {
  const jar = await cookies();
  const { db } = await deps();
  await endSession(db, jar.get(COOKIES.business)?.value);
  jar.delete(COOKIES.business);
  redirect("/login");
}

/** Sends a code to the customer on file for this resolution link — never to an address the visitor types. */
export async function requestCustomerCode(token: string) {
  return run(async () => {
    const { db } = await deps();
    await consume(db, [ipLimit(await clientIp())]);
    const found = await findLink(db, token);
    if (!found.ok) throw new InputError(found.reason);
    const customer = await customerById(db, found.link.customerId);
    if (!customer) throw new InputError("This link isn't valid.");
    if (env().DEMO_MODE) await setDemoInboxCookie(customer.email, customer.businessId);
    return sendCode(db, { purpose: "customer", subjectId: customer.id, email: customer.email, businessId: customer.businessId });
  });
}

export async function verifyCustomerCode(token: string, code: string) {
  return run(async () => {
    const { db } = await deps();
    const found = await findLink(db, token);
    if (!found.ok) throw new InputError(found.reason);
    const out = await verifyCode(db, { purpose: "customer", subjectId: found.link.customerId, code });
    if (!out.ok) throw new InputError(out.error);
    await setSessionCookie("customer", out.token, out.expiresAt);
    const [c] = await db.select({ businessId: cases.businessId }).from(cases).where(eq(cases.id, found.link.caseId));
    if (c)
      await logEvent(db, {
        businessId: c.businessId,
        caseId: found.link.caseId,
        customerId: found.link.customerId,
        actor: "customer",
        type: "customer.verified",
        message: "Customer verified their email and opened the resolution link",
        dedupeKey: `verified:${found.link.id}`,
      });
    return {};
  });
}
