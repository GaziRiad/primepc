"use client";

import { Heart, Menu, ShieldCheck, X } from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import LoggedOutProfile from "./LoggedOutProfile";
import LoggedInProfile from "./LoggedInProfile";
import Navigation from "./Navigation";
import { useSession } from "next-auth/react";
import { Suspense } from "react";
import Link from "next/link";
import { useFavorites } from "@/hooks/useFavorites";
import CartDrawer from "./CartDrawer";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Button } from "./ui/button";

export default function Header() {
  const { data: session } = useSession();

  const { favorites: favProducts } = useFavorites();

  const mobileLinks = [
    { label: "Products", href: "/products" },
    { label: "About Us", href: "/about" },
    { label: "Blogs", href: "/blogs" },
  ];

  const accountLink = session?.user
    ? { label: "My Account", href: "/my-account" }
    : { label: "Sign in / Register", href: "/signin" };

  const isAdmin = session?.user?.role === "admin";

  const searchFallback = (
    <div className="bg-accent-100 h-12 w-full rounded-2xl" aria-hidden />
  );

  return (
    <header className="bg-background sticky top-0 z-50">
      <div className="border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3 lg:hidden">
            <Drawer direction="left">
              <DrawerTrigger asChild>
                <button
                  type="button"
                  aria-label="Open navigation"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white"
                >
                  <Menu className="size-5" />
                </button>
              </DrawerTrigger>
              <DrawerContent className="p-0">
                <DrawerHeader className="flex items-center justify-between border-b px-4 py-3">
                  <DrawerTitle>Menu</DrawerTitle>
                  <DrawerClose asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Close navigation"
                    >
                      <X className="size-4" />
                    </Button>
                  </DrawerClose>
                </DrawerHeader>
                <div className="px-4 pt-4 pb-6">
                  <nav className="flex flex-col gap-2">
                    {mobileLinks.map((link) => (
                      <DrawerClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="hover:bg-accent-100 rounded-lg px-3 py-2 text-sm font-medium transition"
                        >
                          {link.label}
                        </Link>
                      </DrawerClose>
                    ))}
                    <div className="bg-border my-2 h-px" />
                    <DrawerClose asChild>
                      <Link
                        href={accountLink.href}
                        className="hover:bg-accent-100 rounded-lg px-3 py-2 text-sm font-medium transition"
                      >
                        {accountLink.label}
                      </Link>
                    </DrawerClose>
                  </nav>
                </div>
              </DrawerContent>
            </Drawer>

            <div className="justify-self-center">
              <Logo />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <Link href="/wishlist" className="relative cursor-pointer">
                <Heart className="stroke-1" />
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-1 py-0 text-[10px] text-white">
                  {favProducts?.length || 0}
                </span>
              </Link>

              <CartDrawer />
            </div>
          </div>

          <div className="pb-4 lg:hidden">
            <Suspense fallback={searchFallback}>
              <SearchBar />
            </Suspense>
          </div>

          <div className="hidden lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-6 lg:py-6">
            <Logo />

            <div className="w-full">
              <Suspense fallback={searchFallback}>
                <SearchBar />
              </Suspense>
            </div>

            <div className="flex w-full flex-wrap items-center justify-between gap-4 lg:w-auto lg:flex-nowrap lg:justify-end">
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Link href="/admin" aria-label="Open admin dashboard">
                      <ShieldCheck className="size-4" />
                      Admin
                    </Link>
                  </Button>
                )}

                {session?.user ? (
                  <LoggedInProfile user={session.user} />
                ) : (
                  <LoggedOutProfile />
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <Link href="/wishlist" className="relative cursor-pointer">
                  <Heart className="stroke-1" />
                  <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-1 py-0 text-[10px] text-white">
                    {favProducts?.length || 0}
                  </span>
                </Link>

                <CartDrawer />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <Navigation />
      </div>
    </header>
  );
}
