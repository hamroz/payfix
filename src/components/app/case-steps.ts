export const STEPS = ["Detected", "Link sent", "Plan proposed", "Approved", "Executed", "Refund settled"];

/** Index of the first incomplete step for a case. */
export function stepFor(d: { case: { status: string }; linkActive: boolean; proposals: unknown[] }) {
  const s = d.case.status;
  if (s === "resolved") return STEPS.length;
  if (s === "executing") return 5;
  if (s === "approved") return 4;
  if (s === "proposed") return 3;
  return d.linkActive || d.proposals.length ? 2 : 1;
}
