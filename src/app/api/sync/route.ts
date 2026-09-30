import { syncAll } from "@/lib/server/context";

export const dynamic = "force-dynamic";

/** Polled by open pages. Pulls new chain activity and returns a change marker. */
export async function POST() {
  try {
    return Response.json(await syncAll());
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Sync failed" }, { status: 500 });
  }
}
