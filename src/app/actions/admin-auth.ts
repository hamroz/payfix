"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getI18n } from "@/lib/i18n/server";
import { requestAdminCode, verifyAdminCode } from "@/lib/server/admin/access";
import { endSession } from "@/lib/server/auth";
import { deliverOutbox } from "@/lib/server/email";
import { clientIp, COOKIES, deps, setSessionCookie } from "@/lib/server/context";
import { InputError } from "@/lib/server/invoices";
import { consume, HOUR, rateKey } from "@/lib/server/ratelimit";
import { run } from "./result";

export async function requestAdminCodeAction(email: string) {
  return run(async () => {
    const { db } = await deps();
    await consume(db, [{ key: rateKey("admin-code-ip", await clientIp()), max: 20, windowMs: HOUR, error: "rateSignInNetwork" }]);
    const { locale } = await getI18n();
    const res = await requestAdminCode(db, email, locale);
    // Sent after responding, so an admin's request takes no longer than anyone else's.
    after(() => deliverOutbox(db).catch((err) => console.error("[payfix] admin code delivery failed:", err)));
    return res;
  });
}

export async function verifyAdminCodeAction(email: string, code: string) {
  const res = await run(async () => {
    const { db } = await deps();
    const out = await verifyAdminCode(db, email, code);
    if (!out.ok) throw new InputError(out.error);
    await setSessionCookie("admin", out.token, out.expiresAt);
    return {};
  });
  if (res.ok) redirect("/admin");
  return res;
}

export async function adminSignOut() {
  const jar = await cookies();
  const { db } = await deps();
  await endSession(db, jar.get(COOKIES.admin)?.value);
  jar.delete(COOKIES.admin);
  redirect("/admin/login");
}
