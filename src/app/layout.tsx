import type { Metadata, Viewport } from "next";
// Self-hosted fonts: builds never depend on reaching Google Fonts.
import "@fontsource-variable/sora";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import { Backdrop } from "@/components/ui/background";
import { ToastProvider } from "@/components/ui/toast";
import { themeScript } from "@/components/theme/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PayFix — stablecoin payments, made right", template: "%s · PayFix" },
  description:
    "PayFix turns incorrect stablecoin payments into an agreed, completed settlement through one shared resolution link.",
  applicationName: "PayFix",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F7FB" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F1A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme is set by the inline script before hydration.
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <Backdrop />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
