"use client";

import { usePathname } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

const routeLabels: Array<[RegExp, string]> = [
  [/^\/admin\/orders(?:\/.*)?$/, "Orders"],
  [/^\/admin\/products\/new$/, "New product"],
  [/^\/admin\/products\/[^/]+$/, "Edit product"],
  [/^\/admin\/products(?:\/.*)?$/, "Products"],
  [/^\/admin\/categories\/new$/, "New category"],
  [/^\/admin\/categories\/[^/]+$/, "Edit category"],
  [/^\/admin\/categories(?:\/.*)?$/, "Categories"],
  [/^\/admin\/marketing(?:\/.*)?$/, "Marketing"],
];

const getAdminItems = (pathname: string) => {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Admin", href: "/admin" },
  ];

  if (pathname === "/admin") return items;

  const section = pathname.split("/")[2];

  if (section === "products") {
    items.push({ label: "Products", href: "/admin/products" });
  }

  if (section === "categories") {
    items.push({ label: "Categories", href: "/admin/categories" });
  }

  const current = routeLabels.find(([pattern]) => pattern.test(pathname));
  const currentLabel = current?.[1];

  if (
    currentLabel &&
    currentLabel !== items[items.length - 1]?.label &&
    currentLabel !== "Products" &&
    currentLabel !== "Categories"
  ) {
    items.push({ label: currentLabel });
  }

  if (
    currentLabel &&
    !["New product", "Edit product", "New category", "Edit category"].includes(
      currentLabel,
    ) &&
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
