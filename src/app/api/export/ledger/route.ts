import { renderMemo } from "@/lib/i18n/english";
import { getI18n } from "@/lib/i18n/server";
import { fromUnits } from "@/lib/money";
import { currentWorkspace, deps } from "@/lib/server/context";
import { ledgerView } from "@/lib/server/views";

export const dynamic = "force-dynamic";

const cell = (v: string | null | undefined) => {
  const s = v ?? "";
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * Every posting as CSV: one row per account movement, amounts in exact decimal token units.
 * Headers, entry kinds, accounts, and memos are in the visitor's language; ids, dates, and amounts are not.
 */
export async function GET() {
  const i18n = await getI18n();
  const { m } = i18n;
  const biz = (await currentWorkspace())?.biz;
  if (!biz) return new Response(m.errors.exportSignIn, { status: 401 });
  const { db } = await deps();
  const entries = await ledgerView(db, biz.id);
  const c = m.exportCsv.columns;
  const kinds: Record<string, string | undefined> = m.exportCsv.kinds;
  const lines = [[c.date, c.entryId, c.kind, c.memo, c.account, c.amount, c.invoice, c.caseId].map(cell).join(",")];
  for (const e of [...entries].reverse()) {
    for (const p of e.postings) {
      lines.push(
        [
          e.createdAt,
          e.id,
          cell(kinds[e.kind] ?? e.kind),
          cell(renderMemo(i18n, e.memo)),
          cell(m.exportCsv.accounts[p.account]),
          fromUnits(BigInt(p.amount)),
          p.invoiceNumber ?? "",
          e.caseId ?? "",
        ].join(","),
      );
    }
  }
  // A byte-order mark makes spreadsheet apps read non-English text as UTF-8.
  const bom = i18n.locale === "en" ? "" : "\uFEFF";
  return new Response(bom + lines.join("\n") + "\n", {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="payfix-ledger-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
