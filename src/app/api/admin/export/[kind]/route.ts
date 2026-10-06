import { getI18n } from "@/lib/i18n/server";
import { audit } from "@/lib/server/admin/audit";
import { EXPORT_KINDS, exportCsv, type ExportKind } from "@/lib/server/admin/export";
import { parseRange } from "@/lib/server/admin/stats";
import { currentAdmin, deps } from "@/lib/server/context";

export const dynamic = "force-dynamic";

/** Admin CSV exports. Anyone but a signed-in admin gets a plain 404; every export is audited. */
export async function GET(req: Request, { params }: RouteContext<"/api/admin/export/[kind]">) {
  const admin = await currentAdmin();
  const { kind } = await params;
  if (!admin || !EXPORT_KINDS.includes(kind as ExportKind)) return new Response("Not found", { status: 404 });
  const q = new URL(req.url).searchParams;
  const range = parseRange(q.get("range"));
  const cohort = q.get("c") || null;
  const i18n = await getI18n();
  const { db } = await deps();
  const { csv, rows } = await exportCsv(db, kind as ExportKind, range, i18n.m, { cohort });
  await audit(db, { adminEmail: admin, action: "export", targetType: "export", targetId: kind, data: { kind, range, rows, ...(cohort ? { cohort } : {}) } });
  // A byte-order mark makes spreadsheet apps read non-English text as UTF-8.
  const bom = i18n.locale === "en" ? "" : "﻿";
  return new Response(bom + csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="payfix-${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
