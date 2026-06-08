"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { label: "Vue d’ensemble", href: "/admin" },
  { label: "Commandes", href: "/admin/orders" },
  { label: "Produits", href: "/admin/products" },
  { label: "Catégories", href: "/admin/categories" },
  { label: "Marketing", href: "/admin/marketing" },
  { label: "E-mails", href: "/admin/email" },
];

export default function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/admin"
            ? pathname === tab.href
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent-100 hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
