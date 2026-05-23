"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import type { ToasterProps } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";

type ClientShellProps = {
  children: ReactNode;
};

export default function ClientShell({ children }: ClientShellProps) {
  const [toastPosition, setToastPosition] =
    useState<ToasterProps["position"]>("top-center");

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");

    const updatePosition = () => {
      setToastPosition(media.matches ? "bottom-center" : "top-center");
    };

    updatePosition();
    media.addEventListener("change", updatePosition);

    return () => {
      media.removeEventListener("change", updatePosition);
    };
  }, []);

  return (
    <SessionProvider>
      <Header />
      <main>{children}</main>
      <WhatsAppButton />
      <Toaster position={toastPosition} />
    </SessionProvider>
  );
}
