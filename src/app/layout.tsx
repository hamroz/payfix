import type { Metadata, Viewport } from "next";
// Self-hosted fonts: builds never depend on reaching Google Fonts.
import "@fontsource-variable/sora";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import { Backdrop } from "@/components/ui/background";
import { ToastProvider } from "@/components/ui/toast";
import { themeScript } from "@/components/theme/theme";
import { I18nProvider } from "@/lib/i18n/client";
import { LOCALES } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { getI18n } from "@/lib/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { m, locale } = await getI18n();
  return {
    title: { default: m.meta.title, template: "%s · PayFix" },
    description: m.meta.description,
    applicationName: "PayFix",
    openGraph: { locale, alternateLocale: LOCALES.filter((l) => l !== locale) },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F7FB" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F1A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale } = await getI18n();
  return (
    // data-theme is set by the inline script before hydration.
    <html lang={locale} className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <Backdrop />
        <I18nProvider locale={locale} messages={dictionaries[locale]}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
