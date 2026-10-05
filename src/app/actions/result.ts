import { UserError } from "@/lib/i18n/errors";
import { getI18n } from "@/lib/i18n/server";
import type { Translator } from "@/lib/i18n/translate";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/**
 * Turns low-level failures (RPC errors, simulation logs) into one sentence a person can act
 * on, in their language. The raw error is logged server-side, never shown.
 */
export function friendlyError(i18n: Translator, err: unknown): string {
  const m = i18n.m.errors.network;
  const msg = err instanceof Error ? `${err.message} ${String((err as { cause?: unknown }).cause ?? "")}` : String(err);
  if (/insufficient (funds|lamports)|custom program error: 0x1\b|0x1$/i.test(msg)) return m.insufficientFunds;
  if (/blockhash not found|block height exceeded|expired/i.test(msg)) return m.expired;
  if (/429|too many requests|rate limit/i.test(msg)) return m.busy;
  if (/timed out|timeout|fetch failed|ECONNRESET|ENOTFOUND/i.test(msg)) return m.unreachable;
  return m.generic;
}

/** Runs an action body and turns expected errors into messages the UI can show, in the request's language. */
export async function run<T extends object>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (err) {
    if (err instanceof UserError) return { ok: false, error: err.render(await getI18n()) };
    // Next.js uses thrown errors for redirects; let those through.
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    console.error("[payfix] action failed:", err);
    return { ok: false, error: friendlyError(await getI18n(), err) };
  }
}
