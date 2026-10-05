"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Messages } from "./messages";
import { createTranslator, type Translator } from "./translate";

const I18nContext = createContext<Translator | null>(null);

/** Mounted once in the root layout with the request's language and its dictionary. */
export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const value = useMemo(() => createTranslator(locale, messages), [locale, messages]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Translator in Client Components: `const { m, t, p } = useI18n()`. */
export function useI18n(): Translator {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
