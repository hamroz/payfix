import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Languages } from "lucide-react";
import { LEGAL_DOCS, type LegalDocId } from "@/components/marketing/site-footer";
import { getLegalDoc, type Block } from "@/content/legal";
import { env } from "@/lib/env";
import { getI18n } from "@/lib/i18n/server";

export async function legalMetadata(id: LegalDocId): Promise<Metadata> {
  const { locale } = await getI18n();
  const { doc } = getLegalDoc(locale, id);
  return { title: doc.title, description: doc.description };
}

/** One legal document: title, table of contents, sections, and links to the other documents. */
export async function LegalDocument({ id }: { id: LegalDocId }) {
  const i18n = await getI18n();
  const { m, t, rich } = i18n;
  const { doc, locale, fallback } = getLegalDoc(i18n.locale, id);
  // Marks English text shown on a page whose chrome is in another language.
  const docLang = fallback ? locale : undefined;
  const email = env().CONTACT_EMAIL;

  const contact: ReactNode = email
    ? rich(
        m.legal.page.contactEmail,
        {
          link: (c) => (
            <a href={`mailto:${email}`} className="break-words text-violet underline decoration-violet/40 underline-offset-2 transition hover:decoration-violet">
              {c}
            </a>
          ),
        },
        { email },
      )
    : m.legal.page.contactFallback;

  const text = (s: string) =>
    s.split("{contact}").map((part, i) => (
      <Fragment key={i}>
        {i > 0 && contact}
        {rich(part, { b: (c) => <strong className="font-semibold text-fg">{c}</strong> })}
      </Fragment>
    ));

  const blocks = (list: Block[]) =>
    list.map((b, i) =>
      typeof b === "string" ? (
        <p key={i}>{text(b)}</p>
      ) : (
        <ul key={i} className="list-disc space-y-2 pl-5 marker:text-violet">
          {b.list.map((item, j) => (
            <li key={j} className="pl-1">
              {text(item)}
            </li>
          ))}
        </ul>
      ),
    );

  const toc = (
    <ol lang={docLang} className="space-y-1 text-[13px]">
      {doc.sections.map((s, i) => (
        <li key={s.id}>
          <a href={`#${s.id}`} className="flex gap-2.5 rounded-lg px-2 py-1.5 text-fg-2 transition hover:bg-veil/[0.05] hover:text-fg">
            <span className="tabular font-mono text-[11px] leading-5 text-fg-3">{String(i + 1).padStart(2, "0")}</span>
            <span>{s.heading}</span>
          </a>
        </li>
      ))}
    </ol>
  );

  const note = i18n.locale === "en" ? null : fallback ? m.legal.page.fallbackNote : m.legal.page.translationNote;
  const others = LEGAL_DOCS.filter((d) => d !== id);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8 max-w-3xl">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-fg-3 transition hover:text-fg">
          <ArrowLeft className="size-3.5" />
          {m.legal.page.backHome}
        </Link>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{m.legal.footer.legalHeading}</p>
        <h1 lang={docLang} className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-[40px] sm:leading-tight">
          {doc.title}
        </h1>
        <p className="mt-3 text-sm text-fg-3">
          <time dateTime={doc.updated}>{t(m.legal.page.updated, { date: i18n.date(`${doc.updated}T12:00:00Z`) })}</time>
        </p>
        {note && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-veil/10 bg-veil/[0.04] px-3.5 py-2.5 text-xs leading-relaxed text-fg-2">
            <Languages className="mt-px size-4 shrink-0 text-violet" />
            {note}
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)] lg:self-start lg:overflow-y-auto">
          <details className="glass group rounded-2xl lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
              {m.legal.page.onThisPage}
              <ChevronDown className="size-4 text-fg-3 transition group-open:rotate-180" />
            </summary>
            <nav aria-label={m.legal.page.onThisPage} className="border-t border-veil/[0.06] p-2">
              {toc}
            </nav>
          </details>
          <nav aria-label={m.legal.page.onThisPage} className="hidden lg:block">
            <p className="mb-2 px-2 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{m.legal.page.onThisPage}</p>
            {toc}
          </nav>
        </aside>

        <div className="min-w-0">
          <article lang={docLang} className="glass rounded-2xl px-5 py-6 sm:px-10 sm:py-10">
            <div className="max-w-[68ch] space-y-4 text-[15px] leading-relaxed text-fg-2">{blocks(doc.intro)}</div>
            {doc.sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-heading`} className="mt-10 max-w-[68ch] scroll-mt-6 border-t border-veil/[0.06] pt-8">
                <h2 id={`${s.id}-heading`} className="flex items-baseline gap-3 font-display text-lg font-semibold tracking-tight text-fg sm:text-xl">
                  <span className="tabular font-mono text-xs font-normal text-violet">{String(i + 1).padStart(2, "0")}</span>
                  {s.heading}
                </h2>
                <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-fg-2">{blocks(s.blocks)}</div>
              </section>
            ))}
          </article>

          <nav aria-label={m.legal.page.otherDocuments} className="mt-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-fg-3">{m.legal.page.otherDocuments}</p>
            <ul className="grid gap-3 sm:grid-cols-3">
              {others.map((d) => (
                <li key={d}>
                  <Link
                    href={`/${d}`}
                    className="glass group flex items-center justify-between gap-2 rounded-xl px-4 py-3 text-sm font-medium text-fg transition hover:border-violet/30"
                  >
                    {m.legal.docs[d]}
                    <ArrowRight className="size-4 text-fg-3 transition group-hover:translate-x-0.5 group-hover:text-violet" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
