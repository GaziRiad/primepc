"use client";

import { usePathname } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";

const accountLabels: Record<string, string> = {
  "/my-account/account-details": "Account details",
  "/my-account/adress": "Address",
  "/my-account/orders": "Orders",
};

export default function AccountBreadcrumbs() {
  const pathname = usePathname();
  const currentLabel = accountLabels[pathname];

  return (
    <Breadcrumbs
      items={[
        { label: "Home", href: "/" },
        { label: "My account", href: "/my-account" },
        ...(currentLabel ? [{ label: currentLabel }] : []),
      ]}
    />
  );
}
