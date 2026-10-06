"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";
import { env } from "@/lib/env";

/** Remembers the visitor's language for a year and re-renders the current page in it. */
export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return;
  (await cookies()).set(LOCALE_COOKIE, locale, {
    // Read by the client-side switcher too, so not httpOnly. Holds no personal data.
    httpOnly: false,
    sameSite: "lax",
    secure: env().APP_URL.startsWith("https://"),
    path: "/",
    expires: new Date(Date.now() + 365 * 864e5),
  });
  refresh();
}
