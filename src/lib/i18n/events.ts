// Renders activity-log events (and other stored text) in the viewer's language. Isomorphic and
// dictionary-free, so client components can use it; English for storage is in ./english.ts.
import type { Role } from "@/lib/roles";
import type { Translator } from "./translate";
import type { Messages } from "./messages";

type EventMessages = Messages["events"];

/** One line of a plan, with its amount preformatted (`formatUsd`). `number` is null when the invoice is unknown. */
export type PlanLineData = { type: "invoice" | "credit" | "refund"; amount: string; number?: string | null };

/** One difference between two versions of a plan; `code` names its sentence in `m.events.changes`. */
export type PlanChange = {
  code: Exclude<keyof EventMessages["changes"], "separator">;
  number?: string | null;
  amount?: string;
  from?: string;
  to?: string;
};

/**
 * What each event type stores in `data` to be rendered: money preformatted with `formatUsd`,
 * addresses shortened, roles as ids. `variant` picks the sentence when a type has several.
 * Version numbers may be numbers (older readers of `data.version` expect one).
 */
export type EventVars = {
  "invoice.created": { number: string; customer: string; amount: string };
  "invoice.paid": { number: string };
  "invoice.overdue": { number: string; remaining: string };
  "customer.created": { name: string; email: string };
  "customer.verified": Record<string, unknown>;
  "payment.received":
    | { variant: "settled" | "settledLate"; customer: string | null; amount: string; number: string }
    | { variant: "partial" | "partialLate"; customer: string | null; amount: string; number: string; remaining: string };
  "transfer.out": { amount: string; address: string };
  "transfer.unmatched": { amount: string; address: string };
  "case.opened": { variant: "duplicate" | "overpayment"; amount: string; number: string };
  "case.assigned": { customer: string };
  "case.resolved": { variant: "settled" | "refunded"; amount: string };
  "link.sent": { email: string };
  "proposal.submitted":
    | { variant: "first"; version: number; lines: PlanLineData[] }
    | { variant: "revised"; version: number; changes: PlanChange[] }
    | { variant: "unchanged"; version: number };
  "proposal.approved": { version: number; shortHash: string };
  "proposal.declined": { version: number; note: string };
  "approval.invalidated":
    | { variant: "changed"; previous: number; version: number; changes: PlanChange[] }
    | { variant: "resubmitted"; previous: number; version: number };
  "plan.executed": { variant: "refundReserved"; amount: string } | { variant: "resolved" };
  "refund.submitted": { amount: string; destination: string };
  "refund.confirmed": { amount: string };
  "refund.failed": Record<string, unknown>;
  "refund.expired": Record<string, unknown>;
  "credit.applied": { amount: string; number: string };
  "member.added": { email: string; role: Role };
  "member.role_changed": { email: string | null; role: Role };
  "member.removed": { email: string | null };
  "wallet.added": { label: string; address: string };
  "wallet.activated": { label: string; address: string };
  "wallet.removed": { label: string; address: string };
};

export type EventType = keyof EventVars;

export type EventLike = { type: string; message: string; data?: Record<string, unknown> | null };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const camel = (s: string) => s.replace(/_(\w)/g, (_, c: string) => c.toUpperCase());

/** Fills a template, or returns null when a placeholder has no value (old or incomplete data). */
export function fill(i18n: Translator, template: string, vars: Record<string, string>): string | null {
  for (const [, name] of template.matchAll(/\{(\w+)\}/g)) if (!(name in vars)) return null;
  return i18n.t(template, vars);
}

function joinAll(parts: (string | null)[], separator: string): string | null {
  return parts.some((p) => p === null) ? null : parts.join(separator);
}

/** A plan's lines as one phrase ("$60.00 to INV-0002, $40.00 refunded"). */
export function planLinesText(i18n: Translator, lines: PlanLineData[]): string | null {
  const l = i18n.m.events.planLines;
  const templates: Record<string, string | undefined> = { invoice: l.invoice, credit: l.credit, refund: l.refund };
  return joinAll(
    lines.map((line) => {
      const template = templates[line.type];
      return template && typeof line.amount === "string"
        ? fill(i18n, template, { amount: line.amount, number: line.number ?? i18n.m.events.fallbacks.invoice })
        : null;
    }),
    l.separator,
  );
}

/** One change between plan versions as a sentence. */
export function changeText(i18n: Translator, c: PlanChange): string | null {
  const template = (i18n.m.events.changes as Record<string, string>)[c.code];
  if (c.code === ("separator" as string) || typeof template !== "string") return null;
  const vars: Record<string, string> = { number: c.number ?? i18n.m.events.fallbacks.invoice };
  for (const k of ["amount", "from", "to"] as const) if (typeof c[k] === "string") vars[k] = c[k];
  return fill(i18n, template, vars);
}

export const changesText = (i18n: Translator, changes: PlanChange[]) => joinAll(changes.map((c) => changeText(i18n, c)), i18n.m.events.changes.separator);

/** Turns stored data into template values, translating nested ids and lists. */
function eventVars(i18n: Translator, data: Record<string, unknown>): Record<string, string> {
  const { m } = i18n;
  const vars: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (k === "lines" && Array.isArray(v)) {
      const text = planLinesText(i18n, v.filter(isRecord) as PlanLineData[]);
      if (text !== null && v.every(isRecord)) vars.lines = text;
    } else if (k === "changes" && Array.isArray(v)) {
      const text = changesText(i18n, v.filter(isRecord) as PlanChange[]);
      if (text !== null && v.every(isRecord)) vars.changes = text;
    } else if (k === "role" && typeof v === "string") {
      vars.role = v in m.roles ? m.roles[v as keyof Messages["roles"]].label : v;
    } else if (v === null && k === "customer") {
      vars.customer = m.events.fallbacks.customer;
    } else if (v === null && k === "email") {
      vars.email = m.events.fallbacks.member;
    } else if (typeof v === "string") {
      vars[k] = v;
    } else if (typeof v === "number") {
      vars[k] = String(v);
    }
  }
  return vars;
}

/** The event's sentence from its type and data, or null when the data can't fill it. */
export function eventText(i18n: Translator, type: string, data: Record<string, unknown> | null | undefined): string | null {
  const d = data ?? {};
  let node: unknown = i18n.m.events;
  for (const part of type.split(".")) node = isRecord(node) ? node[camel(part)] : undefined;
  if (isRecord(node)) node = typeof d.variant === "string" ? node[d.variant] : undefined;
  if (typeof node !== "string") return null;
  return fill(i18n, node, eventVars(i18n, d));
}

/** The event's sentence in the viewer's language; falls back to the stored English message. */
export function renderEvent(i18n: Translator, e: EventLike): string {
  return eventText(i18n, e.type, e.data) ?? e.message;
}

/** Why an approval stopped applying, read from the stored English reason (see `parseApprovalReason`). */
export type ApprovalReason =
  | { kind: "superseded"; version: string; changes: PlanChange[] }
  | { kind: "resubmitted"; version: string }
  | { kind: "changesRequested"; note: string };

/** The reason an approval no longer applies, in the viewer's language; falls back to the stored English. */
export function renderApprovalReason(i18n: Translator, a: { invalidatedReason: string | null; invalidation?: ApprovalReason | null }): string {
  const r = a.invalidation;
  const reasons = i18n.m.events.approvalReasons;
  let text: string | null = null;
  if (r?.kind === "superseded") {
    const changes = changesText(i18n, r.changes);
    text = changes === null ? null : i18n.t(reasons.superseded, { version: r.version, changes });
  } else if (r?.kind === "resubmitted") text = i18n.t(reasons.resubmitted, { version: r.version });
  else if (r?.kind === "changesRequested") text = i18n.t(reasons.changesRequested, { note: r.note });
  return text ?? a.invalidatedReason ?? "";
}
