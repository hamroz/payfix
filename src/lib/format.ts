export function timeAgo(date: Date | string, now = Date.now()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.round((now - d.getTime()) / 1000);
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export const formatDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const formatDateTime = (d: Date | string) =>
  new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/**
 * Inline style that makes a money amount exactly fit its container (the parent needs the
 * Tailwind `@container` class): the font shrinks with the number's length, never below
 * legibility, never above `maxRem`. "$400.00" stays large; "$10,000,000.00" fits in full.
 */
export function amountFit(units: string | bigint, maxRem = 1.5): { fontSize: string } {
  const whole = Math.max(1, (typeof units === "bigint" ? units : BigInt(units)).toString().length - 6);
  const chars = whole + Math.floor((whole - 1) / 3) + 4; // "$" + digits + commas + ".00"
  return { fontSize: `max(0.75rem, min(${maxRem}rem, ${(100 / (0.64 * chars)).toFixed(2)}cqw))` };
}
