import { fromUnits } from "@/lib/money";
import { currentWorkspace, deps } from "@/lib/server/context";
import { ledgerView } from "@/lib/server/views";

export const dynamic = "force-dynamic";

const cell = (v: string | null | undefined) => {
  const s = v ?? "";
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Every posting as CSV: one row per account movement, amounts in exact decimal token units. */
export async function GET() {
  const biz = (await currentWorkspace())?.biz;
  if (!biz) return new Response("Sign in first", { status: 401 });
  const { db } = await deps();
  const entries = await ledgerView(db, biz.id);
  const lines = [["date", "entry_id", "kind", "memo", "account", "amount", "invoice", "case_id"].join(",")];
  for (const e of [...entries].reverse()) {
    for (const p of e.postings) {
      lines.push([e.createdAt, e.id, e.kind, cell(e.memo), p.account, fromUnits(BigInt(p.amount)), p.invoiceNumber ?? "", e.caseId ?? ""].join(","));
    }
  }
  return new Response(lines.join("\n") + "\n", {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="payfix-ledger-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
