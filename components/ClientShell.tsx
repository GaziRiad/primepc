"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { toast, type ToasterProps } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";

type ClientShellProps = {
  children: ReactNode;
};

function SessionInvalidationToast() {
  const { status } = useSession();
  const previousStatus = useRef<string | null>(null);

  useEffect(() => {
    if (
      previousStatus.current === "authenticated" &&
      status === "unauthenticated"
    ) {
      toast.error("Your session expired. Please sign in again.");
    }

    previousStatus.current = status;
  }, [status]);

  return null;
}

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
      <SessionInvalidationToast />
      <Header />
      <main>{children}</main>
      <WhatsAppButton />
      <Toaster position={toastPosition} />
    </SessionProvider>
  );
}
