import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["latin", "arabic"],
  weight: ["300", "400", "500", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#003318",
};

export const metadata: Metadata = {
  title: "DinarZone - Transferts vers le Maghreb",
  description: "Marketplace de transferts d'argent vers l'Algerie et la Tunisie. Comparez les taux, envoyez en toute securite.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${tajawal.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-tajawal)]">
        {children}
      </body>
    </html>
  );
}
