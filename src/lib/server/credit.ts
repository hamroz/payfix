import { and, eq, sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { customers, invoices } from "@/lib/db/schema";
import { move } from "@/lib/domain/ledger";
import { newId } from "@/lib/ids";
import { formatUsd, min } from "@/lib/money";
import { InputError } from "./invoices";
import { logEvent, logInvoicePaid, postEntry } from "./journal";
import { customerCredit, invoiceWithBalance } from "./queries";

/**
 * Applies a customer's credit to one of their open invoices. Runs under a lock on the
 * customer, re-reading both balances, so double clicks or concurrent requests can never
 * spend the same credit twice or push an invoice past its amount.
 */
export async function applyCredit(db: Db, p: { businessId: string; invoiceId: string; amount?: bigint; actorUserId?: string }) {
  return db.transaction(async (t) => {
    const [inv] = await t.select().from(invoices).where(and(eq(invoices.id, p.invoiceId), eq(invoices.businessId, p.businessId)));
    if (!inv) throw new InputError("Invoice not found.");
    await t.execute(sql`select id from ${customers} where id = ${inv.customerId} for update`);
    const credit = await customerCredit(t, inv.customerId);
    const { remaining } = (await invoiceWithBalance(t, inv.id))!;
    const amount = min(p.amount ?? credit, min(credit, remaining));
    if (amount <= 0n) throw new InputError(credit === 0n ? "This customer has no credit left." : "This invoice is already paid.");
    await postEntry(t, {
      businessId: p.businessId,
      key: `credit-apply:${newId("ca")}`,
      kind: "credit",
      memo: `Credit applied to ${inv.number}`,
      postings: move("credit", "invoice", amount, { customerId: inv.customerId }, { invoiceId: inv.id }),
    });
    await logEvent(t, {
      businessId: p.businessId,
      invoiceId: inv.id,
      customerId: inv.customerId,
      actor: "business",
      actorUserId: p.actorUserId,
      type: "credit.applied",
      message: `${formatUsd(amount)} of customer credit applied to ${inv.number}`,
    });
    await logInvoicePaid(t, { businessId: p.businessId, invoiceId: inv.id, actorUserId: p.actorUserId });
    return { applied: amount };
  });
}
