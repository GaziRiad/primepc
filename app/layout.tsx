import { Fjalla_One, Public_Sans } from "next/font/google";
import type { Metadata } from "next";

import "./globals.css";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

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

export default function RootLayout({
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
        <SessionProvider>
          <Header />
        </SessionProvider>

        <main>{children}</main>
        <footer className="h-96 bg-white">
          <h2 className="text-accent mx-auto max-w-7xl py-24 text-2xl font-semibold">
            Footer
          </h2>
        </footer>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
