import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Logo } from "@/components/brand/logo";
import { NetworkPill } from "@/components/app/network-pill";
import { ThemeToggle } from "@/components/theme/theme";
import { DemoInbox } from "@/components/app/demo-inbox";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WalletProviders } from "@/components/wallet/providers";
import { businesses, customers } from "@/lib/db/schema";
import { publicConfig } from "@/lib/env";
import { deps } from "@/lib/server/context";
import { invoiceWithBalance } from "@/lib/server/queries";
import { transferRows } from "@/lib/server/views";
import { getI18n } from "@/lib/i18n/server";
import { Ban } from "lucide-react";
import { Card, EmptyState } from "@/components/ui/primitives";
import { PayPanel } from "./pay-panel";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.pay.title };
}

export default async function PayPage({ params, searchParams }: PageProps<"/pay/[invoiceId]">) {
  const { invoiceId } = await params;
  // Set by the QR tab's wallet chooser when it reopens this page inside a wallet app's browser.
  const { method, amount } = await searchParams;
  const { db } = await deps();
  const inv = await invoiceWithBalance(db, invoiceId);
  if (!inv) notFound();
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, inv.businessId));
  const [cust] = await db.select().from(customers).where(eq(customers.id, inv.customerId));
  const payments = (await transferRows(db, { invoiceId })).filter((t) => t.direction === "in");
  const config = publicConfig();
  const { m, t } = await getI18n();

  return (
    <WalletProviders rpcUrl={config.rpcUrl}>
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between">
          <Logo size={24} />
          <div className="flex items-center gap-2">
            <NetworkPill />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex flex-1 items-start justify-center py-8 sm:py-12">
          {biz.suspendedAt ? (
            <Card className="w-full max-w-md">
              <EmptyState icon={<Ban className="size-5" />} title={m.errors.companyUnavailable} />
            </Card>
          ) : (
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
              business={{ id: biz.id, name: biz.name, wallet: biz.walletAddress }}
              customerName={cust?.name ?? m.common.customer}
              initial={{ method: typeof method === "string" ? method : undefined, amount: typeof amount === "string" ? amount : undefined }}
              payments={payments}
            />
          )}
        </main>
        <p className="pb-2 text-center text-xs text-fg-3">{t(m.pay.directNote, { business: biz.name })}</p>
        <SiteFooter minimal />
      </div>
      {config.demoMode && <DemoInbox />}
    </WalletProviders>
  );
}
