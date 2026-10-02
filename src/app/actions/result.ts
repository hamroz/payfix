import { InputError } from "@/lib/server/invoices";
import { ResolutionError } from "@/lib/server/resolution";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/**
 * Turns low-level failures (RPC errors, simulation logs) into one sentence a person can act
 * on. The raw error is logged server-side, never shown.
 */
export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? `${err.message} ${String((err as { cause?: unknown }).cause ?? "")}` : String(err);
  if (/insufficient (funds|lamports)|custom program error: 0x1\b|0x1$/i.test(msg))
    return "The wallet doesn’t have enough funds for this. Pay a smaller amount, or top it up with the faucet in Settings.";
  if (/blockhash not found|block height exceeded|expired/i.test(msg)) return "The network took too long to confirm. Nothing was charged — try again.";
  if (/429|too many requests|rate limit/i.test(msg)) return "The Solana devnet is busy right now. Wait a few seconds and try again.";
  if (/timed out|timeout|fetch failed|ECONNRESET|ENOTFOUND/i.test(msg)) return "Couldn’t reach the network. Check the transaction status in a moment, then try again.";
  return "Something went wrong. Try again — if it keeps happening, reload the page.";
}

/** Runs an action body and turns expected errors into messages the UI can show. */
export async function run<T extends object>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (err) {
    if (err instanceof ResolutionError || err instanceof InputError) return { ok: false, error: err.message };
    // Next.js uses thrown errors for redirects; let those through.
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    console.error("[payfix] action failed:", err);
    return { ok: false, error: friendlyError(err) };
  }
}
