import type { Messages } from "@/lib/i18n/messages";

/** Labels of the resolution loop's steps, in order. */
export const caseSteps = (m: Messages) => {
  const s = m.cases.steps;
  return [s.detected, s.linkSent, s.planProposed, s.approved, s.executed, s.refundSettled];
};

const STEP_COUNT = 6;

/** Index of the first incomplete step for a case. */
export function stepFor(d: { case: { status: string }; linkActive: boolean; proposals: unknown[] }) {
  const s = d.case.status;
  if (s === "resolved") return STEP_COUNT;
  if (s === "executing") return 5;
  if (s === "approved") return 4;
  if (s === "proposed") return 3;
  return d.linkActive || d.proposals.length ? 2 : 1;
}
