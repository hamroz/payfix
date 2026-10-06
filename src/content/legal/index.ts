// Legal documents by language. Server-only, so the full texts never ship in a client bundle.
import "server-only";
import type { LegalDocId } from "@/components/marketing/site-footer";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import cookies from "./en/cookies";
import privacy from "./en/privacy";
import security from "./en/security";
import terms from "./en/terms";
import ruPrivacy from "./ru/privacy";
import ruTerms from "./ru/terms";
import ruCookies from "./ru/cookies";
import ruSecurity from "./ru/security";
import dePrivacy from "./de/privacy";
import deTerms from "./de/terms";
import deCookies from "./de/cookies";
import deSecurity from "./de/security";
import plPrivacy from "./pl/privacy";
import plTerms from "./pl/terms";
import plCookies from "./pl/cookies";
import plSecurity from "./pl/security";
import fiPrivacy from "./fi/privacy";
import fiTerms from "./fi/terms";
import fiCookies from "./fi/cookies";
import fiSecurity from "./fi/security";
import esPrivacy from "./es/privacy";
import esTerms from "./es/terms";
import esCookies from "./es/cookies";
import esSecurity from "./es/security";
import zhPrivacy from "./zh/privacy";
import zhTerms from "./zh/terms";
import zhCookies from "./zh/cookies";
import zhSecurity from "./zh/security";
import hiPrivacy from "./hi/privacy";
import hiTerms from "./hi/terms";
import hiCookies from "./hi/cookies";
import hiSecurity from "./hi/security";
import type { LegalDoc } from "./types";

export type { Block, LegalDoc, LegalSection } from "./types";

type LegalSet = Record<LegalDocId, LegalDoc>;

/**
 * English is complete and is the fallback. Add a translation by creating
 * `./<locale>/<doc>.ts` and listing it here, e.g. `de: { privacy: dePrivacy }`.
 */
const docs: { en: LegalSet } & Partial<Record<Exclude<Locale, "en">, Partial<LegalSet>>> = {
  en: { privacy, terms, cookies, security },
  ru: { privacy: ruPrivacy, terms: ruTerms, cookies: ruCookies, security: ruSecurity },
  de: { privacy: dePrivacy, terms: deTerms, cookies: deCookies, security: deSecurity },
  pl: { privacy: plPrivacy, terms: plTerms, cookies: plCookies, security: plSecurity },
  fi: { privacy: fiPrivacy, terms: fiTerms, cookies: fiCookies, security: fiSecurity },
  es: { privacy: esPrivacy, terms: esTerms, cookies: esCookies, security: esSecurity },
  zh: { privacy: zhPrivacy, terms: zhTerms, cookies: zhCookies, security: zhSecurity },
  hi: { privacy: hiPrivacy, terms: hiTerms, cookies: hiCookies, security: hiSecurity },
};

/** The document in `locale`, or the English one when it isn't translated yet (`fallback: true`). */
export function getLegalDoc(locale: Locale, id: LegalDocId): { doc: LegalDoc; locale: Locale; fallback: boolean } {
  const translated = locale === DEFAULT_LOCALE ? undefined : docs[locale]?.[id];
  if (translated) return { doc: translated, locale, fallback: false };
  return { doc: docs.en[id], locale: DEFAULT_LOCALE, fallback: locale !== DEFAULT_LOCALE };
}
