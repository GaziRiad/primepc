"use client";

import { usePathname } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";

const accountLabels: Record<string, string> = {
  "/my-account/account-details": "Détails du compte",
  "/my-account/adress": "Adresse",
  "/my-account/orders": "Commandes",
};

export default function AccountBreadcrumbs() {
  const pathname = usePathname();
  const currentLabel = accountLabels[pathname];

  return (
    <Breadcrumbs
      items={[
        { label: "Accueil", href: "/" },
        { label: "Mon compte", href: "/my-account" },
        ...(currentLabel ? [{ label: currentLabel }] : []),
      ]}
    />
  );
}
