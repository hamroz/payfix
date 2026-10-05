import { env } from "@/lib/env";
import { clientIp, deps } from "@/lib/server/context";
import { buildRequestedPayment, InputError, paymentRequestLabel } from "@/lib/server/invoices";
import { consume, MINUTE, rateKey } from "@/lib/server/ratelimit";

export const dynamic = "force-dynamic";

/**
 * Solana Pay transaction request behind the payment QR code. The wallet GETs a label and
 * icon, then POSTs the scanning account and signs the exact payment we return. Like the pay
 * link itself, the unguessable reference is the capability: it can only pay the business.
 */
const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Accept-Encoding",
  "Cache-Control": "no-store",
};

const fail = (message: string, status: number) => Response.json({ message }, { status, headers: HEADERS });

export function OPTIONS() {
  return new Response(null, { status: 204, headers: HEADERS });
}

export async function GET(_req: Request, ctx: RouteContext<"/api/pay/[reference]">) {
  const { reference } = await ctx.params;
  const { db } = await deps();
  const label = await paymentRequestLabel(db, reference);
  if (!label) return fail("This payment code isn't valid. Refresh the invoice page for a new one.", 404);
  return Response.json({ label, icon: new URL("/payfix-mark.svg", env().APP_URL).toString() }, { headers: HEADERS });
}

export async function POST(req: Request, ctx: RouteContext<"/api/pay/[reference]">) {
  const { reference } = await ctx.params;
  const body = (await req.json().catch(() => null)) as { account?: unknown } | null;
  if (typeof body?.account !== "string") return fail("Missing the paying account.", 400);
  try {
    const d = await deps();
    await consume(d.db, [{ key: rateKey("txreq-ip", await clientIp()), max: 30, windowMs: MINUTE, message: "Too many payment attempts. Try again in a minute." }]);
    return Response.json(await buildRequestedPayment(d, { reference, account: body.account }), { headers: HEADERS });
  } catch (err) {
    if (err instanceof InputError) return fail(err.message, 400);
    console.error("[payfix] transaction request failed:", err instanceof Error ? err.message : err);
    return fail("Couldn't prepare the payment. Try again.", 500);
  }
}
