import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/primitives";
import { customers } from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { deps, requireWorkspace } from "@/lib/server/context";
import { can } from "@/lib/roles";
import { InvoiceForm } from "./invoice-form";

export const metadata: Metadata = { title: "New invoice" };

export default async function NewInvoicePage() {
  const { biz, role } = await requireWorkspace();
  if (!can(role, "editor")) redirect("/app/invoices");
  const { db } = await deps();
  const list = await db.select({ id: customers.id, name: customers.name, email: customers.email }).from(customers).where(eq(customers.businessId, biz.id));
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/app/invoices" className="mb-5 inline-flex items-center gap-1.5 text-sm text-fg-3 hover:text-fg">
        <ArrowLeft className="size-4" /> Invoices
      </Link>
      <PageHeader title="New invoice" subtitle="Your customer pays through a link. PayFix matches the payment to this invoice by a unique on-chain reference." />
      <InvoiceForm customers={list} />
    </div>
  );
}
