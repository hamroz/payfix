import type { Metadata, Viewport } from "next";
// Self-hosted fonts: builds never depend on reaching Google Fonts.
import "@fontsource-variable/sora";
import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import { Backdrop } from "@/components/ui/background";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PayFix — stablecoin payments, made right", template: "%s · PayFix" },
  description:
    "PayFix turns incorrect stablecoin payments into an agreed, completed settlement through one shared resolution link.",
  applicationName: "PayFix",
};

export const viewport: Viewport = { themeColor: "#0B0F1A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <Backdrop />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
