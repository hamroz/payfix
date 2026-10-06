// English text stored in the database (event messages, journal memos, approval reasons), and
// reading it back for display in other languages. Server-side: it carries the English dictionary.
import { en } from "./dictionaries";
import { changesText, eventText, planLinesText, type ApprovalReason, type PlanChange, type PlanLineData } from "./events";
import { createTranslator, type Translator } from "./translate";

/** English translator, for text stored in the database. */
export const englishI18n = createTranslator("en", en);

/** The English sentence stored as `events.message`. Throws if the data doesn't fill the template. */
export function englishEvent(type: string, data: Record<string, unknown> | null | undefined): string {
  const text = eventText(englishI18n, type, data);
  if (text === null) throw new Error(`Event ${type} is missing data for its message`);
  return text;
}

// ── Reading stored English back ────────────────────────────────────────────

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Reads the placeholder values back out of text produced by `template`, or null if it doesn't match. */
function matchTemplate(template: string, text: string): Record<string, string> | null {
  const names: string[] = [];
  const source = template
    .split(/(\{\w+\})/)
    .map((part) => {
      const name = /^\{(\w+)\}$/.exec(part)?.[1];
      if (!name) return escapeRe(part);
      names.push(name);
      return "(.+?)";
    })
    .join("");
  const found = new RegExp(`^${source}$`, "s").exec(text);
  return found ? Object.fromEntries(names.map((n, i) => [n, found[i + 1]])) : null;
}

/** Reads an English plan phrase back into lines. */
function parsePlanLines(text: string): PlanLineData[] | null {
  const l = en.events.planLines;
  const out: PlanLineData[] = [];
  for (const part of text.split(l.separator)) {
    const credit = matchTemplate(l.credit, part);
    const refund = matchTemplate(l.refund, part);
    const invoice = matchTemplate(l.invoice, part);
    if (credit) out.push({ type: "credit", amount: credit.amount });
    else if (refund) out.push({ type: "refund", amount: refund.amount });
    else if (invoice) out.push({ type: "invoice", amount: invoice.amount, number: invoice.number });
    else return null;
  }
  return out;
}

/** Reads English change sentences back into changes. */
function parseChanges(text: string): PlanChange[] | null {
  const c = en.events.changes;
  const codes = Object.keys(c).filter((k) => k !== "separator") as PlanChange["code"][];
  const out: PlanChange[] = [];
  for (const part of text.split(c.separator)) {
    const code = codes.find((k) => matchTemplate(c[k], part));
    if (!code) return null;
    out.push({ code, ...matchTemplate(c[code], part) });
  }
  return out;
}

/** Re-renders stored English text that one of the `source` templates produced, in the viewer's language. */
function rerender<K extends string>(
  i18n: Translator,
  text: string,
  source: Record<K, string>,
  local: Record<K, string>,
): string {
  for (const key of Object.keys(source) as K[]) {
    const vars = matchTemplate(source[key], text);
    if (!vars) continue;
    if ("lines" in vars) {
      const lines = parsePlanLines(vars.lines);
      const rendered = lines && planLinesText(i18n, lines);
      if (!rendered) return text;
      vars.lines = rendered;
    }
    if ("changes" in vars) {
      const changes = parseChanges(vars.changes);
      const rendered = changes && changesText(i18n, changes);
      if (!rendered) return text;
      vars.changes = rendered;
    }
    return i18n.t(local[key], vars);
  }
  return text;
}

/** A journal entry's memo in the viewer's language (memos are stored in English). */
export const renderMemo = (i18n: Translator, memo: string) => rerender(i18n, memo, en.events.memos, i18n.m.events.memos);

/**
 * Reads a stored English approval reason back into its parts, so the UI can show it in the
 * viewer's language with `renderApprovalReason`. Null when it doesn't match a known template.
 */
export function parseApprovalReason(reason: string | null): ApprovalReason | null {
  if (!reason) return null;
  const r = en.events.approvalReasons;
  const resubmitted = matchTemplate(r.resubmitted, reason);
  if (resubmitted) return { kind: "resubmitted", version: resubmitted.version };
  const superseded = matchTemplate(r.superseded, reason);
  const changes = superseded && parseChanges(superseded.changes);
  if (superseded && changes) return { kind: "superseded", version: superseded.version, changes };
  const requested = matchTemplate(r.changesRequested, reason);
  return requested ? { kind: "changesRequested", note: requested.note } : null;
}

const roleByLabel = new Map(Object.entries(en.roles).map(([role, r]) => [r.label.toLowerCase(), role]));

/**
 * Event `data` for display: what was stored, completed from the stored English message when
 * the row predates structured data (older rows only have the sentence), so it still renders
 * in the viewer's language. Returns the stored data unchanged when nothing matches.
 */
export function eventDisplayData(type: string, message: string, data: Record<string, unknown> | null): Record<string, unknown> | null {
  if (eventText(englishI18n, type, data) !== null) return data;
  let node: unknown = en.events;
  for (const part of type.split(".")) node = node && typeof node === "object" ? (node as Record<string, unknown>)[part.replace(/_(\w)/g, (_, c: string) => c.toUpperCase())] : undefined;
  const templates: [string | null, string][] =
    typeof node === "string" ? [[null, node]] : node && typeof node === "object" ? Object.entries(node as Record<string, string>) : [];
  for (const [variant, template] of templates) {
    const vars = typeof template === "string" ? matchTemplate(template, message) : null;
    if (!vars) continue;
    const parsed: Record<string, unknown> = { ...vars };
    if (variant) parsed.variant = variant;
    if ("lines" in vars) parsed.lines = parsePlanLines(vars.lines);
    if ("changes" in vars) parsed.changes = parseChanges(vars.changes);
    if ("role" in vars) parsed.role = roleByLabel.get(vars.role.toLowerCase()) ?? vars.role;
    const merged = { ...parsed, ...data };
    if (eventText(englishI18n, type, merged) !== null) return merged;
  }
  return data;
}
