// Request locale for Server Components, Server Actions, and Route Handlers.
import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { LOCALE_COOKIE, isLocale, matchLocale, type Locale } from "./config";
import { dictionaries } from "./dictionaries";
import { createTranslator } from "./translate";

/** The visitor's chosen language (cookie), else their browser's (Accept-Language), else English. */
export const getLocale = cache(async (): Promise<Locale> => {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;
  return matchLocale((await headers()).get("accept-language"));
});

/** Translator for the current request: `const { m, t, p } = await getI18n()`. */
export const getI18n = cache(async () => {
  const locale = await getLocale();
  return createTranslator(locale, dictionaries[locale]);
});
