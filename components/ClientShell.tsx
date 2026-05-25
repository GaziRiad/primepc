"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { toast, type ToasterProps } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import Header from "@/components/Header";
import WhatsAppButton from "@/components/WhatsAppButton";

type ClientShellProps = {
  children: ReactNode;
};

function SessionInvalidationToast() {
  const { status, data: session } = useSession();
  const previousStatus = useRef<string | null>(null);
  const invalidatedRef = useRef(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      !session?.user?.id &&
      !invalidatedRef.current
    ) {
      invalidatedRef.current = true;
      toast.error("Votre session a expiré. Veuillez vous reconnecter.");
      void signOut({ redirect: false });
    }

    if (
      previousStatus.current === "authenticated" &&
      status === "unauthenticated" &&
      !invalidatedRef.current
    ) {
      toast.error("Votre session a expiré. Veuillez vous reconnecter.");
    }

    previousStatus.current = status;
  }, [status, session?.user?.id]);

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
