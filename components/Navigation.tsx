"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  badge?: string;
  highlight?: boolean;
  label: string;
  href: string;
  subLinks?: boolean;
};

const Pages: NavItem[] = [
  { label: "Tous les produits", href: "/products" },
  {
    label: "Top seller",
    href: "/products?topSeller=true",
    badge: "HOT",
    highlight: true,
  },
  { label: "À propos", href: "/about" },
  { label: "Contactez nous", href: "/contact" },
  { label: "Blog", href: "/blogs" },
] as const;

export default function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [compact, setCompact] = useState(false);
  const isTopSellerView =
    pathname === "/products" && searchParams.get("topSeller") === "true";

  useEffect(() => {
    const onScroll = () => {
      // Shrink after user scrolls down a bit
      setCompact(window.scrollY > 120);
    };

    onScroll(); // initialize on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`border-b ${compact && "shadow-sm"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-4 overflow-x-auto text-sm whitespace-nowrap">
          {Pages.map((link) => {
            const isActive = link.highlight
              ? isTopSellerView
              : link.href === "/products"
                ? pathname === "/products" && !isTopSellerView
                : pathname === link.href;

            return (
              <li
                key={link.href}
                className={`border-background border-t-3 font-semibold transition-all duration-200 ${
                  compact ? "py-3" : "py-4.5"
                } ${
                  link.highlight
                    ? "text-red-600 hover:border-red-600 hover:text-red-700"
                    : "hover:text-primary hover:border-primary"
                } ${
                  isActive
                    ? link.highlight
                      ? "border-t-3 border-red-600 text-red-700"
                      : "text-primary border-primary border-t-3"
                    : "border-t-0"
                }`}
              >
                <Link href={link.href} className="flex items-center gap-1.5">
                  {link.label}
                  {link.badge && (
                    <span className="rounded-full bg-red-600 px-1.5 py-0.5 text-[9px] leading-none font-bold text-white shadow-sm">
                      {link.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
