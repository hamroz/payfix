import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Ban } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ThemeToggle } from "@/components/theme/theme";
import { WorkspaceSwitcher } from "@/components/app/workspace-switcher";
import { Card } from "@/components/ui/primitives";
import { env } from "@/lib/env";
import { getI18n } from "@/lib/i18n/server";
import { currentWorkspace } from "@/lib/server/context";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.app.suspendedPage.title, robots: { index: false } };
}

/** Where members land when the company they're in has been suspended by a platform admin. */
export default async function SuspendedPage() {
  const ws = await currentWorkspace();
  if (!ws) redirect("/login");
  if (!ws.biz || !ws.role) redirect("/onboarding");
  if (!ws.biz.suspendedAt) redirect("/app");
  const { m, t, rich } = await getI18n();
  const s = m.app.suspendedPage;
  const contact = env().CONTACT_EMAIL;
  return (
    <div className="relative flex min-h-dvh flex-col">
      <ThemeToggle className="absolute right-5 top-5" />
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-12">
        <LogoMark size={44} className="mb-8" />
        <Card className="w-full max-w-md p-6 sm:p-8">
          <span className="grid size-11 place-items-center rounded-2xl border border-rose/20 bg-rose/10 text-rose">
            <Ban className="size-5" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">{s.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-fg-2">{t(s.body, { company: ws.biz.name })}</p>
          <p className="mt-3 text-sm text-fg-2">
            {contact ? rich(s.contact, { email: (c) => <a href={`mailto:${contact}`} className="text-violet hover:underline">{c}</a> }, { email: contact }) : s.contactGeneric}
          </p>
          <div className="mt-6">
            <WorkspaceSwitcher current={{ businessId: ws.biz.id, name: ws.biz.name, role: ws.role, suspended: true }} workspaces={ws.workspaces} email={ws.user.email} />
          </div>
        </Card>
      </main>
      <SiteFooter minimal />
    </div>
  );
}
