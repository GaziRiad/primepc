import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  subLinks?: boolean;
};

const Pages: NavItem[] = [
  {
    label: "Popular",
    href: "/popular",
  },
  {
    label: "Shop",
    href: "/shop",
  },
  {
    label: "About Us",
    href: "/about",
  },
  {
    label: "Blogs",
    href: "/blogs",
  },
] as const;

export default function Navigation() {
  return (
    <nav className="border-b">
      <div className="mx-auto max-w-7xl">
        <ul className="flex items-center gap-4 text-sm">
          {Pages.map((link, index) => (
            <li
              key={index}
              className="hover:text-primary hover:border-primary border-background border-t-3 py-4 transition-all"
            >
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
