"use client";

import Link from "next/link";

import {
  Birdhouse,
  LayoutDashboard,
  LogOut,
  Store,
  User,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

const Tabs: Tab[] = [
  {
    label: "Dashboard",
    id: "my-account",
    href: "/my-account",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    id: "ordres",
    href: "/my-account/orders",
    icon: Store,
  },
  {
    label: "Adress",
    id: "adress",
    href: "/my-account/adress",
    icon: Birdhouse,
  },
  {
    label: "Account Details",
    id: "account-details",
    href: "/my-account/account-details",
    icon: User,
  },
] as const;

export default function TabList() {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-3 px-4 py-6 sm:px-6 lg:px-8">
      {Tabs.map((tab, index) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <li key={index}>
            <Link
              href={tab.href}
              className={`group hover:bg-primary flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-light transition-all ${isActive ? "bg-primary text-white" : "bg-accent-100/30 text-accent-500"}`}
            >
              <Icon
                className={`stroke-[1.5px] transition-all ${
                  isActive
                    ? "stroke-white"
                    : "stroke-accent-500 group-hover:stroke-white"
                }`}
              />
              <span className="transition-all group-hover:text-white">
                {tab.label}
              </span>
            </Link>
          </li>
        );
      })}
      <li>
        <button
          className="group text-accent-500 bg-accent-100/30 hover:bg-primary flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm font-light transition-all"
          onClick={() => {
            signOut({ redirectTo: "/" });
          }}
        >
          <LogOut className="stroke-accent-500 stroke-[1.5px] transition-all group-hover:stroke-white" />
          <span className="transition-all group-hover:text-white">Logout</span>
        </button>
      </li>
    </ul>
  );
}
