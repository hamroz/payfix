import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Users } from "lucide-react";
import { Stagger, StaggerItem } from "@/components/ui/motion";
import { Card, EmptyState, PageHeader } from "@/components/ui/primitives";
import { customers } from "@/lib/db/schema";
import { formatUsd } from "@/lib/money";
import { deps, requireBusiness } from "@/lib/server/context";
import { customerCredit, invoicesWithBalances } from "@/lib/server/queries";
import { initials } from "@/lib/format";
import { AddCustomer } from "./add-customer";

export const metadata: Metadata = { title: "Customers" };

export default async function CustomersPage() {
  const biz = await requireBusiness();
  const { db } = await deps();
  const list = await db.select().from(customers).where(eq(customers.businessId, biz.id)).orderBy(customers.name);
  const rows = await Promise.all(
    list.map(async (c) => {
      const invs = await invoicesWithBalances(db, { businessId: biz.id, customerId: c.id });
      return {
        ...c,
        open: invs.filter((i) => i.remaining > 0n).length,
        outstanding: invs.reduce((a, i) => a + i.remaining, 0n),
        paid: invs.reduce((a, i) => a + i.applied, 0n),
        credit: await customerCredit(db, c.id),
      };
    }),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Customers" title="Customers" subtitle="Repeat clients, their balances, and any credit they’ve chosen to keep with you." actions={<AddCustomer />} />
      {rows.length === 0 ? (
        <Card>
          <EmptyState icon={<Users className="size-5" />} title="No customers yet" body="Add a customer to start invoicing." />
        </Card>
      ) : (
        <Stagger className="grid gap-3 sm:grid-cols-2">
          {rows.map((c) => (
            <StaggerItem key={c.id}>
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-violet/15 font-display text-sm font-semibold text-violet">{initials(c.name)}</span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="truncate text-xs text-fg-3">{c.email}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    { l: "Paid", v: formatUsd(c.paid) },
                    { l: "Outstanding", v: formatUsd(c.outstanding) },
                    { l: "Credit", v: formatUsd(c.credit) },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-veil/[0.03] px-2 py-2.5">
                      <p className="text-[11px] text-fg-3">{s.l}</p>
                      <p className="tabular mt-0.5 font-display text-sm font-semibold">{s.v}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
