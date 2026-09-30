import { InputError } from "@/lib/server/invoices";
import { ResolutionError } from "@/lib/server/resolution";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** Runs an action body and turns expected errors into messages the UI can show. */
export async function run<T extends object>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (err) {
    if (err instanceof ResolutionError || err instanceof InputError) return { ok: false, error: err.message };
    // Next.js uses thrown errors for redirects; let those through.
    if (err && typeof err === "object" && "digest" in err && String((err as { digest: unknown }).digest).startsWith("NEXT_")) throw err;
    console.error("[payfix] action failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "Something went wrong. Try again." };
  }
}
