"use client";

import { usePathname } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

const routeLabels: Array<[RegExp, string]> = [
  [/^\/admin\/orders(?:\/.*)?$/, "Commandes"],
  [/^\/admin\/products\/new$/, "Nouveau produit"],
  [/^\/admin\/products\/[^/]+$/, "Modifier le produit"],
  [/^\/admin\/products(?:\/.*)?$/, "Produits"],
  [/^\/admin\/categories\/new$/, "Nouvelle catégorie"],
  [/^\/admin\/categories\/[^/]+$/, "Modifier la catégorie"],
  [/^\/admin\/categories(?:\/.*)?$/, "Catégories"],
  [/^\/admin\/marketing(?:\/.*)?$/, "Marketing"],
];

const getAdminItems = (pathname: string) => {
  const items: BreadcrumbItem[] = [
    { label: "Accueil", href: "/" },
    { label: "Admin", href: "/admin" },
  ];

  if (pathname === "/admin") return items;

  const section = pathname.split("/")[2];

  if (section === "products") {
    items.push({ label: "Produits", href: "/admin/products" });
  }

  if (section === "categories") {
    items.push({ label: "Catégories", href: "/admin/categories" });
  }

  const current = routeLabels.find(([pattern]) => pattern.test(pathname));
  const currentLabel = current?.[1];

  if (
    currentLabel &&
    currentLabel !== items[items.length - 1]?.label &&
    currentLabel !== "Produits" &&
    currentLabel !== "Catégories"
  ) {
    items.push({ label: currentLabel });
  }

  if (
    currentLabel &&
    ![
      "Nouveau produit",
      "Modifier le produit",
      "Nouvelle catégorie",
      "Modifier la catégorie",
    ].includes(currentLabel) &&
    currentLabel !== items[items.length - 1]?.label
  ) {
    items.push({ label: currentLabel });
  }

  return items;
};

export default function AdminBreadcrumbs() {
  const pathname = usePathname();

  return <Breadcrumbs className="mb-4" items={getAdminItems(pathname)} />;
}
