import { Fjalla_One, Public_Sans } from "next/font/google";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Footer from "@/components/Footer";
import ClientShell from "@/components/ClientShell";
import SmoothScroller from "@/components/SmoothScroller";

import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "PRIMEPC",
  description:
    "Primepc is a website that sells laptops and accessories. We offer a wide range of products at competitive prices, and we are committed to providing excellent customer service for algerians.",
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
      lang="en"
      className={`${cn("font-sans", publicSans.variable)} ${cn("font-fjalla", fjalla.variable)}`}
    >
      <body className={`relative antialiased`}>
        <SmoothScroller>
          <ClientShell>{children}</ClientShell>
          <Footer />
        </SmoothScroller>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
