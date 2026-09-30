import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Logo } from "@/components/brand/logo";
import { NetworkPill } from "@/components/app/network-pill";
import { DemoInbox } from "@/components/app/demo-inbox";
import { WalletProviders } from "@/components/wallet/providers";
import { businesses, customers } from "@/lib/db/schema";
import { publicConfig } from "@/lib/env";
import { deps } from "@/lib/server/context";
import { invoiceWithBalance } from "@/lib/server/queries";
import { transferRows } from "@/lib/server/views";
import { PayPanel } from "./pay-panel";

export const metadata: Metadata = { title: "Pay invoice" };

export default async function PayPage({ params }: PageProps<"/pay/[invoiceId]">) {
  const { invoiceId } = await params;
  const { db } = await deps();
  const inv = await invoiceWithBalance(db, invoiceId);
  if (!inv) notFound();
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, inv.businessId));
  const [cust] = await db.select().from(customers).where(eq(customers.id, inv.customerId));
  const payments = (await transferRows(db, { invoiceId })).filter((t) => t.direction === "in");
  const config = publicConfig();

  return (
    <WalletProviders rpcUrl={config.rpcUrl}>
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between">
          <Logo size={24} />
          <NetworkPill />
        </header>
        <main className="flex flex-1 items-start justify-center py-8 sm:py-12">
          <PayPanel
            config={config}
            invoice={{
              id: inv.id,
              number: inv.number,
              title: inv.title,
              amount: inv.amount.toString(),
              applied: inv.applied.toString(),
              remaining: inv.remaining.toString(),
              dueAt: inv.dueAt.toISOString(),
            }}
            business={{ name: biz.name, wallet: biz.walletAddress }}
            customerName={cust?.name ?? "Customer"}
            payments={payments}
          />
        </main>
        <p className="pb-2 text-center text-xs text-fg-3">
          Payments go directly to {biz.name}’s wallet. PayFix never holds funds. Test money only.
        </p>
      </div>
      {config.demoMode && <DemoInbox />}
    </WalletProviders>
  );
}
