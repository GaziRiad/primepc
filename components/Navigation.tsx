"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavItem = {
  label: string;
  href: string;
  subLinks?: boolean;
};

const Pages: NavItem[] = [
  { label: "Popular", href: "/popular" },
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Blogs", href: "/blogs" },
] as const;

export default function Navigation() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);

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
      <div className="mx-auto max-w-7xl">
        <ul className="flex items-center gap-4 text-sm">
          {Pages.map((link) => (
            <li
              key={link.href}
              className={`hover:text-primary hover:border-primary border-background border-t-3 font-semibold transition-all duration-200 ${
                compact ? "py-4" : "py-6"
              } ${
                pathname === link.href
                  ? "text-primary border-primary border-t-3"
                  : "border-t-0"
              }`}
            >
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
