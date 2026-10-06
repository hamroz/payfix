/** Typed confirmation for destructive actions: the exact name (emails ignore case), surrounding spaces ignored. */
export function confirmMatches(expected: string, typed: string) {
  const t = typed.trim();
  if (!t) return false;
  return expected.includes("@") ? t.toLowerCase() === expected.toLowerCase() : t === expected.trim();
}

/** What an admin types to confirm deleting several items at once. Not translated: it's a fixed keyword. */
export const BULK_DELETE_WORD = "DELETE";
