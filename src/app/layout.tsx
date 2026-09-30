import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import { Backdrop } from "@/components/ui/background";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "PayFix — stablecoin payments, made right", template: "%s · PayFix" },
  description:
    "PayFix turns incorrect stablecoin payments into an agreed, completed settlement through one shared resolution link.",
  applicationName: "PayFix",
};

export const viewport: Viewport = { themeColor: "#0B0F1A", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Backdrop />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
