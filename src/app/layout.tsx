import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#003318",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "DinarZone - Transferts vers le Maghreb",
    template: "%s | DinarZone",
  },
  description:
    "Marketplace de transferts d'argent vers l'Algerie et la Tunisie. Comparez les taux, envoyez en toute securite. 10 corridors, cash pickup et BaridiMob.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://dinarzone-app.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "DinarZone",
    title: "DinarZone - Transferts vers le Maghreb",
    description:
      "Envoyez de l'argent vers l'Algerie et la Tunisie. Taux competitifs, cash pickup, BaridiMob, virement bancaire.",
    locale: "fr_FR",
    alternateLocale: ["en_US", "ar_DZ"],
  },
  twitter: {
    card: "summary_large_image",
    title: "DinarZone - Transferts vers le Maghreb",
    description: "Envoyez de l'argent vers l'Algerie et la Tunisie en toute securite.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-tajawal)]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
