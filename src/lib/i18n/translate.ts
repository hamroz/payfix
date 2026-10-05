// The translator: interpolation, plurals, rich text, and locale-aware dates. Isomorphic.

import { Fragment, createElement, type ReactNode } from "react";
import { LOCALE_META, type Locale } from "./config";
import type { Messages } from "./messages";

/** Plural message: CLDR categories for the language (`one`/`few`/`many`/`other` …); `other` is required. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

export type Vars = Record<string, string | number | bigint>;

/**
 * Replaces `{name}` placeholders. Numbers are formatted for the locale (grouping included), so
 * pass identifiers, years, and versions as strings. Unknown placeholders are left as written.
 */
export function interpolate(msg: string, vars: Vars | undefined, tag: string): string {
  if (!vars) return msg;
  return msg.replace(/\{(\w+)\}/g, (all, key: string) => {
    if (!(key in vars)) return all;
    const v = vars[key];
    return typeof v === "string" ? v : new Intl.NumberFormat(tag).format(v);
  });
}

type RichTags = Record<string, (chunk: ReactNode) => ReactNode>;

/**
 * Renders inline markup: `"Read the <link>terms</link>"` with `{ link: (c) => <a>{c}</a> }`.
 * Tags don't nest; an unknown tag renders its content as plain text.
 */
function richText(msg: string, tags: RichTags, vars: Vars | undefined, tag: string): ReactNode {
  const text = interpolate(msg, vars, tag);
  const out: ReactNode[] = [];
  const re = /<(\w+)>(.*?)<\/\1>/gs;
  let last = 0;
  let i = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const render = tags[m[1]];
    out.push(createElement(Fragment, { key: i++ }, render ? render(m[2]) : m[2]));
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export type Translator = ReturnType<typeof createTranslator>;

/**
 * Usage: `const { m, t, p } = i18n;` then `m.invoices.title` for plain strings,
 * `t(m.invoices.due, { date })` to fill placeholders, `p(m.invoices.count, n)` for plurals.
 */
export function createTranslator(locale: Locale, messages: Messages) {
  const tag = LOCALE_META[locale].tag;
  const rules = new Intl.PluralRules(tag);
  const rel = new Intl.RelativeTimeFormat(tag, { numeric: "auto", style: "short" });

  const t = (msg: string, vars?: Vars) => interpolate(msg, vars, tag);
  const p = (forms: PluralForms, count: number, vars?: Vars) => interpolate(forms[rules.select(count)] ?? forms.other, { count, ...vars }, tag);
  const rich = (msg: string, tags: RichTags, vars?: Vars) => richText(msg, tags, vars, tag);

  const date = (d: Date | string) => new Date(d).toLocaleDateString(tag, { month: "short", day: "numeric", year: "numeric" });
  const dateTime = (d: Date | string) => new Date(d).toLocaleString(tag, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  const number = (n: number | bigint) => new Intl.NumberFormat(tag).format(n);

  /** "just now", "5 min ago", "3 days ago"; older than a week shows the date. */
  const timeAgo = (d: Date | string, now = Date.now()) => {
    const s = Math.round((now - new Date(d).getTime()) / 1000);
    if (s < 10) return messages.common.justNow;
    if (s < 60) return rel.format(-s, "second");
    const min = Math.round(s / 60);
    if (min < 60) return rel.format(-min, "minute");
    const h = Math.round(min / 60);
    if (h < 24) return rel.format(-h, "hour");
    const days = Math.round(h / 24);
    if (days < 7) return rel.format(-days, "day");
    return date(d);
  };

  return { locale, tag, m: messages, t, p, rich, date, dateTime, number, timeAgo };
}
