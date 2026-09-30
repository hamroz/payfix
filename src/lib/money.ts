// All amounts are integer token base units (bigint). Never use floats for money.

export const DEFAULT_DECIMALS = 6;

const AMOUNT_RE = /^\d+(\.\d+)?$/;

/** Parses a user-entered decimal string ("600", "60.5") into base units. Throws on invalid input. */
export function toUnits(input: string, decimals = DEFAULT_DECIMALS): bigint {
  const s = input.trim().replace(/,/g, "");
  if (!AMOUNT_RE.test(s)) throw new Error(`Invalid amount: "${input}"`);
  const [whole, frac = ""] = s.split(".");
  if (frac.length > decimals) throw new Error(`Amount has more than ${decimals} decimal places`);
  return BigInt(whole) * 10n ** BigInt(decimals) + BigInt(frac.padEnd(decimals, "0") || "0");
}

/** Like toUnits but returns null instead of throwing. */
export function tryToUnits(input: string, decimals = DEFAULT_DECIMALS): bigint | null {
  try {
    return toUnits(input, decimals);
  } catch {
    return null;
  }
}

/** Exact decimal string, trailing zeros trimmed to at least 2 places ("1000.00", "0.123456"). */
export function fromUnits(units: bigint, decimals = DEFAULT_DECIMALS): string {
  const neg = units < 0n;
  const abs = neg ? -units : units;
  const base = 10n ** BigInt(decimals);
  const whole = abs / base;
  let frac = (abs % base).toString().padStart(decimals, "0").replace(/0+$/, "");
  if (frac.length < 2) frac = frac.padEnd(Math.min(2, decimals), "0");
  return `${neg ? "-" : ""}${whole}${frac ? `.${frac}` : ""}`;
}

/** Display format: "$1,000.00". Keeps sub-cent precision if present. */
export function formatUsd(units: bigint, decimals = DEFAULT_DECIMALS): string {
  const [whole, frac] = fromUnits(units, decimals).split(".");
  const neg = whole.startsWith("-");
  const digits = neg ? whole.slice(1) : whole;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}$${grouped}${frac ? `.${frac}` : ""}`;
}

export const sum = (values: bigint[]) => values.reduce((a, b) => a + b, 0n);
export const min = (a: bigint, b: bigint) => (a < b ? a : b);
export const max = (a: bigint, b: bigint) => (a > b ? a : b);
