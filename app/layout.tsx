import { Fjalla_One, Public_Sans } from "next/font/google";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Footer from "@/components/Footer";
import ClientShell from "@/components/ClientShell";

import { cn } from "@/lib/utils";
import { getSiteUrl, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "PRIMEPC propose des ordinateurs portables et des accessoires à prix compétitifs, avec un service client attentif partout en Algérie.",
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "Ordinateurs portables, PC et accessoires sélectionnés avec livraison partout en Algérie.",
    images: [{ url: "/logo-main.png", alt: "PRIMEPC Algérie" }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Ordinateurs portables, PC et accessoires sélectionnés avec livraison partout en Algérie.",
    images: ["/logo-main.png"],
  },
};

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const fjalla = Fjalla_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-fjalla",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${cn("font-sans", publicSans.variable)} ${cn("font-fjalla", fjalla.variable)}`}
    >
      <body className={`relative antialiased`}>
        <ClientShell>{children}</ClientShell>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
