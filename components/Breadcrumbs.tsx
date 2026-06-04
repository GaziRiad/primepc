import Link from "next/link";

import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

type BreadcrumbsProps = {
  className?: string;
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ className, items }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "text-accent-400 flex flex-wrap items-center gap-2 text-sm",
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span
            key={`${item.label}-${index}`}
            className="flex items-center gap-2"
          >
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-primary transition">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-accent-600" : undefined}>
                {item.label}
              </span>
            )}
            {!isLast && <span aria-hidden>/</span>}
          </span>
        );
      })}
    </nav>
  );
}
