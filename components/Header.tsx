"use client";

import {
  BookOpen,
  Heart,
  Home,
  Info,
  Menu,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const { favorites: favProducts } = useFavorites();

  const favoritesCount = favProducts?.length || 0;

  const mobileLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Products", href: "/products", icon: ShoppingBag },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: Heart,
      badge: favoritesCount > 0 ? String(favoritesCount) : undefined,
    },
    { label: "Cart", href: "/cart", icon: ShoppingCart },
    { label: "About Us", href: "/about", icon: Info },
    { label: "Blogs", href: "/blogs", icon: BookOpen },
  ];

  const accountLink = session?.user
    ? { label: "My Account", href: "/my-account" }
    : { label: "Sign in / Register", href: "/signin" };

  const isAdmin = session?.user?.role === "admin";
  const userName = session?.user?.name || "Guest";
  const userEmail =
    session?.user?.email || "Sign in to save orders and favorites.";
  const initials = userName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
              <DrawerContent className="border-0 bg-gradient-to-b from-primary-900 via-primary-800 to-primary-700 p-0 text-white before:border-transparent before:bg-transparent data-[vaul-drawer-direction=left]:w-[82vw] data-[vaul-drawer-direction=left]:sm:max-w-sm">
                <div className="relative flex min-h-screen flex-col overflow-hidden">
                  <div className="pointer-events-none absolute -right-24 top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
                  <div className="pointer-events-none absolute -left-20 bottom-10 h-52 w-52 rounded-full bg-primary-400/40 blur-3xl" />

                  <DrawerHeader className="relative flex items-center justify-between border-0 px-5 pt-6 pb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.32em] text-white/60">
                        Primepc
                      </p>
                      <DrawerTitle className="text-lg font-semibold text-white">
                        Navigation
                      </DrawerTitle>
                    </div>
                    <DrawerClose asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Close navigation"
                        className="bg-white/10 text-white hover:bg-white/20"
                      >
                        <X className="size-4" />
                      </Button>
                    </DrawerClose>
                  </DrawerHeader>

                  <div className="relative px-5">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-sm">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={session?.user?.image ?? undefined} />
                        <AvatarFallback>{initials || "GU"}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-semibold text-white">
                          {userName}
                        </span>
                        <span className="truncate text-xs text-white/70">
                          {userEmail}
                        </span>
                      </div>
                    </div>
                  </div>

                  <nav className="relative mt-6 flex-1 overflow-y-auto px-4 pb-6">
                    <div className="flex flex-col gap-2">
                      {mobileLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                          <DrawerClose asChild key={link.href}>
                            <Link
                              href={link.href}
                              className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] transition ${
                                isActive
                                  ? "bg-white/20 text-white shadow-sm ring-1 ring-white/20"
                                  : "text-white/75 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <Icon className="size-4 text-white/70 transition group-hover:text-white" />
                              <span className="flex-1">{link.label}</span>
                              {link.badge && (
                                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                                  {link.badge}
                                </span>
                              )}
                            </Link>
                          </DrawerClose>
                        );
                      })}

                      {isAdmin && (
                        <DrawerClose asChild>
                          <Link
                            href="/admin"
                            className="group flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/20"
                          >
                            <ShieldCheck className="size-4 text-white" />
                            Admin dashboard
                          </Link>
                        </DrawerClose>
                      )}
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-white/60">
                        Account
                      </p>
                      <DrawerClose asChild>
                        <Link
                          href={accountLink.href}
                          className="mt-3 inline-flex w-full items-center justify-between rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/25"
                        >
                          {accountLink.label}
                          <User className="size-4" />
                        </Link>
                      </DrawerClose>
                    </div>
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
