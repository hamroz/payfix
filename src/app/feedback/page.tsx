import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { NetworkPill } from "@/components/app/network-pill";
import { SiteFooter } from "@/components/marketing/site-footer";
import { ThemeToggle } from "@/components/theme/theme";
import { getI18n } from "@/lib/i18n/server";
import { currentUser } from "@/lib/server/context";
import { FeedbackForm } from "./feedback-form";

export async function generateMetadata(): Promise<Metadata> {
  const { m } = await getI18n();
  return { title: m.feedback.title, robots: { index: false } };
}

/** The tester survey. `?c=<batch>` tags responses so the admin can compare rounds of testing. */
export default async function FeedbackPage({ searchParams }: PageProps<"/feedback">) {
  const { c } = await searchParams;
  const user = await currentUser();
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/">
          <Logo size={24} />
        </Link>
        <div className="flex items-center gap-2">
          <NetworkPill />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-12 sm:px-8">
        <FeedbackForm cohort={typeof c === "string" ? c : null} signedInEmail={user?.email ?? null} />
      </main>
      <SiteFooter minimal />
    </div>
  );
}
