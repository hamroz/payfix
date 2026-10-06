import { friendlyError } from "@/app/actions/result";
import { env } from "@/lib/env";
import { UserError } from "@/lib/i18n/errors";
import { getI18n } from "@/lib/i18n/server";
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

/** Wallets show `message` to the payer, so it's in the language their wallet app asked for. */
const fail = async (err: UserError, status: number) => Response.json({ message: err.render(await getI18n()) }, { status, headers: HEADERS });

export function OPTIONS() {
  return new Response(null, { status: 204, headers: HEADERS });
}

export async function GET(_req: Request, ctx: RouteContext<"/api/pay/[reference]">) {
  const { reference } = await ctx.params;
  const { db } = await deps();
  const label = await paymentRequestLabel(db, reference);
  if (!label) return fail(new InputError("paymentCodeInvalid"), 404);
  return Response.json({ label, icon: new URL("/payfix-mark.svg", env().APP_URL).toString() }, { headers: HEADERS });
}

export async function POST(req: Request, ctx: RouteContext<"/api/pay/[reference]">) {
  const { reference } = await ctx.params;
  const body = (await req.json().catch(() => null)) as { account?: unknown } | null;
  if (typeof body?.account !== "string") return fail(new InputError("paymentAccountMissing"), 400);
  try {
    const d = await deps();
    await consume(d.db, [{ key: rateKey("txreq-ip", await clientIp()), max: 30, windowMs: MINUTE, error: "ratePaymentNetwork" }]);
    return Response.json(await buildRequestedPayment(d, { reference, account: body.account }), { headers: HEADERS });
  } catch (err) {
    if (err instanceof UserError) return fail(err, 400);
    console.error("[payfix] transaction request failed:", err instanceof Error ? err.message : err);
    return Response.json({ message: friendlyError(await getI18n(), err) }, { status: 500, headers: HEADERS });
  }
}
