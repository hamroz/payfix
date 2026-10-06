import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { Link2Off } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { DemoInbox } from "@/components/app/demo-inbox";
import { LiveSync } from "@/components/app/live-sync";
import { NetworkPill } from "@/components/app/network-pill";
import { ThemeToggle } from "@/components/theme/theme";
import { Card, EmptyState } from "@/components/ui/primitives";
import { SiteFooter } from "@/components/marketing/site-footer";
import { WalletProviders } from "@/components/wallet/providers";
import { businesses, customers } from "@/lib/db/schema";
import { publicConfig } from "@/lib/env";
import { currentCustomerId, deps } from "@/lib/server/context";
import { findLink } from "@/lib/server/resolution";
import { caseDetail } from "@/lib/server/views";
import { getI18n } from "@/lib/i18n/server";
import { ResolvePanel } from "./resolve-panel";
import { VerifyGate } from "./verify-gate";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.resolve.title, robots: { index: false } };
}

export default async function ResolutionPage({ params }: PageProps<"/r/[token]">) {
  const { token } = await params;
  const { db } = await deps();
  const config = publicConfig();
  const found = await findLink(db, token);
  const { m, t } = await getI18n();

  const shell = (children: React.ReactNode, business?: string, businessId?: string) => (
    <WalletProviders rpcUrl={config.rpcUrl}>
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size={24} />
            {business && <span className="hidden text-sm text-fg-3 sm:inline">{t(m.resolve.forBusiness, { business })}</span>}
          </div>
          <div className="flex items-center gap-2">
            {businessId && <LiveSync scope={{ link: token }} label={false} />}
            <NetworkPill />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 py-8 sm:py-10">{children}</main>
        <SiteFooter minimal />
      </div>
      {config.demoMode && <DemoInbox />}
    </WalletProviders>
  );

  if (!found.ok) {
    return shell(
      <Card className="mx-auto max-w-md">
        <EmptyState icon={<Link2Off className="size-5" />} title={m.resolve.linkUnavailable} body={m.errors[found.error]} />
      </Card>,
    );
  }

  const { link } = found;
  const [cust] = await db.select().from(customers).where(eq(customers.id, link.customerId));
  const d = (await caseDetail(db, link.caseId))!;
  const [biz] = await db.select().from(businesses).where(eq(businesses.id, d.case.businessId));
  const sessionCustomer = await currentCustomerId();

  if (sessionCustomer !== link.customerId) {
    return shell(<VerifyGate token={token} businessName={biz.name} customerName={cust.name} />, biz.name);
  }

  // The customer sees only their own invoices.
  const own = new Set(d.openInvoices.map((i) => i.id));
  const invoiceNumbers = Object.fromEntries(Object.entries(d.invoiceNumbers).filter(([id]) => own.has(id)));

  return shell(
    <ResolvePanel token={token} businessName={biz.name} customerName={cust.name} config={config} detail={{ ...d, invoiceNumbers }} />,
    biz.name,
    biz.id,
  );
}
