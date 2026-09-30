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
