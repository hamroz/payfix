import { syncCompany } from "@/lib/server/context";

export const dynamic = "force-dynamic";

/** Polled by open pages for one company (?b=<businessId>). Pulls new chain activity and returns a change marker. */
export async function POST(req: Request) {
  const businessId = new URL(req.url).searchParams.get("b");
  if (!businessId) return Response.json({ error: "Missing company" }, { status: 400 });
  try {
    return Response.json(await syncCompany(businessId));
  } catch {
    return Response.json({ error: "Sync failed" }, { status: 500 });
  }
}
