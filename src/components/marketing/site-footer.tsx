import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/cn";

export const LEGAL_DOCS = ["privacy", "terms", "cookies", "security"] as const;
export type LegalDocId = (typeof LEGAL_DOCS)[number];

/**
 * Public footer: disclaimer, legal links, and the language menu. Used on the landing, auth, customer, and legal pages.
 * `minimal` pages can show the floating demo inbox bottom-left, so the footer leaves room beneath it.
 */
export async function SiteFooter({ minimal = false }: { minimal?: boolean }) {
  const { m, t } = await getI18n();
  const f = m.legal.footer;
  return (
    <footer className={cn("mx-auto w-full max-w-6xl border-t border-veil/[0.06] px-5 pt-8 text-xs text-fg-3 sm:px-8", minimal ? "pb-24" : "pb-8")}>
      {!minimal && (
        <div className="mb-8 grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo size={20} />
            <p className="mt-3 leading-relaxed">{f.disclaimer}</p>
          </div>
          <nav aria-label={f.productHeading}>
            <p className="mb-3 font-medium text-fg-2">{f.productHeading}</p>
            <ul className="space-y-2">
              <li>
                <Link href="/#how" className="transition hover:text-fg">
                  {f.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition hover:text-fg">
                  {f.signIn}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={f.legalHeading}>
            <p className="mb-3 font-medium text-fg-2">{f.legalHeading}</p>
            <ul className="space-y-2">
              {LEGAL_DOCS.map((d) => (
                <li key={d}>
                  <Link href={`/${d}`} className="transition hover:text-fg">
                    {m.legal.docs[d]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>{t(f.rights, { year: String(new Date().getFullYear()) })}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {minimal &&
            LEGAL_DOCS.map((d) => (
              <Link key={d} href={`/${d}`} className="transition hover:text-fg">
                {m.legal.docs[d]}
              </Link>
            ))}
          <LanguageSwitcher up />
        </div>
      </div>
    </footer>
  );
}
