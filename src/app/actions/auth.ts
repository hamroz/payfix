"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { businessForEmail, endSession, sendCode, verifyCode } from "@/lib/server/auth";
import { COOKIES, deps, setSessionCookie } from "@/lib/server/context";
import { findLink } from "@/lib/server/resolution";
import { customerById } from "@/lib/server/queries";
import { run } from "./result";

export async function requestBusinessCode(email: string) {
  return run(async () => {
    const { db } = await deps();
    const biz = await businessForEmail(db, email);
    // Don't reveal whether an account exists; just say a code was sent if it does.
    if (!biz) return { maskedEmail: email.trim(), sent: false };
    const { maskedEmail } = await sendCode(db, { purpose: "business", subjectId: biz.id, email: biz.ownerEmail });
    return { maskedEmail, sent: true };
  });
}

export async function verifyBusinessCode(email: string, code: string) {
  const res = await run(async () => {
    const { db } = await deps();
    const biz = await businessForEmail(db, email);
    if (!biz) throw new Error("That code isn't right. Check it and try again.");
    const out = await verifyCode(db, { purpose: "business", subjectId: biz.id, code });
    if (!out.ok) throw new Error(out.error);
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
    const found = await findLink(db, token);
    if (!found.ok) throw new Error(found.reason);
    const customer = await customerById(db, found.link.customerId);
    if (!customer) throw new Error("This link isn't valid.");
    return sendCode(db, { purpose: "customer", subjectId: customer.id, email: customer.email });
  });
}

export async function verifyCustomerCode(token: string, code: string) {
  return run(async () => {
    const { db } = await deps();
    const found = await findLink(db, token);
    if (!found.ok) throw new Error(found.reason);
    const out = await verifyCode(db, { purpose: "customer", subjectId: found.link.customerId, code });
    if (!out.ok) throw new Error(out.error);
    await setSessionCookie("customer", out.token, out.expiresAt);
    return {};
  });
}
