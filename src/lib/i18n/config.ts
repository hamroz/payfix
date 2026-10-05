// Supported languages. Isomorphic: safe to import from client and server code.

export const LOCALES = ["en", "ru", "de", "pl", "fi", "es", "zh", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie holding the visitor's chosen language. Absent until they pick one; then Accept-Language decides. */
export const LOCALE_COOKIE = "pf-locale";

/** `name` is the language's own name (what the switcher shows); `tag` is the BCP 47 tag for Intl formatting. */
export const LOCALE_META: Record<Locale, { name: string; english: string; tag: string }> = {
  en: { name: "English", english: "English", tag: "en-US" },
  ru: { name: "Русский", english: "Russian", tag: "ru-RU" },
  de: { name: "Deutsch", english: "German", tag: "de-DE" },
  pl: { name: "Polski", english: "Polish", tag: "pl-PL" },
  fi: { name: "Suomi", english: "Finnish", tag: "fi-FI" },
  es: { name: "Español", english: "Spanish", tag: "es-ES" },
  zh: { name: "简体中文", english: "Chinese (Simplified)", tag: "zh-CN" },
  hi: { name: "हिन्दी", english: "Hindi", tag: "hi-IN" },
};

export const isLocale = (v: unknown): v is Locale => typeof v === "string" && (LOCALES as readonly string[]).includes(v);

/** Picks the best supported locale from an Accept-Language header ("de-DE,de;q=0.9,en;q=0.8"). */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(",")
    .map((part, i) => {
      const [range, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { lang: range.trim().toLowerCase().split("-")[0], q: q ? Number(q.slice(2)) || 0 : 1, i };
    })
    .filter((r) => r.lang && r.q > 0)
    .sort((a, b) => b.q - a.q || a.i - b.i);
  return ranked.map((r) => r.lang).find(isLocale) ?? DEFAULT_LOCALE;
}
