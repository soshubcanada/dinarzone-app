import type { Metadata } from "next";

const SITE_NAME = "DinarZone";
const DESCRIPTION =
  "Transferts Canada → Maghreb. Taux de change compétitifs, livraison BaridiMob en quelques minutes, tarification transparente. Société de services monétaires enregistrée au Canada.";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Transfert Canada → Algérie`,
  description: DESCRIPTION,
  alternates: {
    canonical: "/fr/clients",
    languages: {
      "fr-CA": "/fr/clients",
      "en-CA": "/en/clients",
      "ar-DZ": "/ar/clients",
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — L'argent au pays, sans compromis`,
    description: DESCRIPTION,
    locale: "fr_CA",
    images: [
      {
        url: "/clients/hero-bg.jpg",
        width: 2000,
        height: 1091,
        alt: "DinarZone — transferts vers le Maghreb",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Transfert Canada → Algérie`,
    description: DESCRIPTION,
    images: ["/clients/hero-bg.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
