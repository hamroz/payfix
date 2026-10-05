import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { cases, invoices } from "@/lib/db/schema";
import { currentUser, deps, syncCompany } from "@/lib/server/context";
import { findLink } from "@/lib/server/resolution";
import { membershipRole } from "@/lib/server/workspaces";

export const dynamic = "force-dynamic";

/**
 * The company a poller may sync, from what its page already holds: a member's company
 * (?b=), a public pay link's invoice (?invoice=), or a live resolution link (?link=).
 * A bare company id from someone outside the company gets nothing.
 */
async function authorizedCompany(db: Db, q: URLSearchParams): Promise<string | null> {
  const b = q.get("b");
  if (b) {
    const user = await currentUser();
    return user && (await membershipRole(db, user.id, b)) ? b : null;
  }
  const invoiceId = q.get("invoice");
  if (invoiceId) {
    const [inv] = await db.select({ businessId: invoices.businessId }).from(invoices).where(eq(invoices.id, invoiceId));
    return inv?.businessId ?? null;
  }
  const token = q.get("link");
  if (token) {
    const found = await findLink(db, token);
    if (!found.ok) return null;
    const [c] = await db.select({ businessId: cases.businessId }).from(cases).where(eq(cases.id, found.link.caseId));
    return c?.businessId ?? null;
  }
  return null;
}

/** Polled by open pages. Pulls new chain activity for the company and returns a change marker. */
export async function POST(req: Request) {
  try {
    const { db } = await deps();
    const businessId = await authorizedCompany(db, new URL(req.url).searchParams);
    if (!businessId) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(await syncCompany(businessId));
  } catch {
    return Response.json({ error: "Sync failed" }, { status: 500 });
  }
}
