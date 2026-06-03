"use client";

import {
  BookOpen,
  Heart,
  Home,
  Info,
  LogIn,
  LogOut,
  Mail,
  Menu,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  X,
} from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import LoggedOutProfile from "./LoggedOutProfile";
import LoggedInProfile from "./LoggedInProfile";
import Navigation from "./Navigation";
import { signOut, useSession } from "next-auth/react";
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
    { label: "Accueil", href: "/", icon: Home },
    { label: "Produits", href: "/products", icon: ShoppingBag },
    {
      label: "Favoris",
      href: "/wishlist",
      icon: Heart,
      badge: favoritesCount > 0 ? String(favoritesCount) : undefined,
    },
    { label: "Panier", href: "/cart", icon: ShoppingCart },
    { label: "A propos", href: "/about", icon: Info },
    { label: "Contact", href: "/contact", icon: Mail },
    { label: "Blog", href: "/blogs", icon: BookOpen },
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
              <DrawerContent className="border-0 bg-white p-0 text-slate-900 before:border-transparent before:bg-transparent data-[vaul-drawer-direction=left]:w-[82vw] data-[vaul-drawer-direction=left]:sm:max-w-sm">
                <div className="relative flex min-h-screen flex-col overflow-hidden">
                  <DrawerHeader className="relative flex items-start justify-between border-0 px-5 pt-5 pb-3">
                    <div className="flex flex-col gap-2">
                      <DrawerClose asChild>
                        <Logo />
                      </DrawerClose>
                      <DrawerTitle className="text-xs font-semibold tracking-[0.28em] text-slate-500 uppercase">
                        Navigation
                      </DrawerTitle>
                    </div>
                    <DrawerClose asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Close navigation"
                        className="absolute top-4 right-4 bg-slate-100 text-slate-700 hover:bg-slate-200"
                      >
                        <X className="size-4" />
                      </Button>
                    </DrawerClose>
                  </DrawerHeader>

                  <div className="relative px-5">
                    <DrawerClose asChild>
                      <Link
                        href={accountLink.href}
                        className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
                      >
                        <Avatar className="h-11 w-11">
                          <AvatarImage
                            src={session?.user?.image ?? undefined}
                          />
                          <AvatarFallback>{initials || "GU"}</AvatarFallback>
                        </Avatar>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-semibold text-slate-900">
                            {userName}
                          </span>
                          <span className="truncate text-xs text-slate-500">
                            {userEmail}
                          </span>
                        </div>
                      </Link>
                    </DrawerClose>

                    <div className="mt-3">
                      {session?.user ? (
                        <DrawerClose asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 w-full justify-start gap-2 rounded-xl border-slate-200 bg-white text-slate-800 hover:bg-slate-100"
                            onClick={() => void signOut({ callbackUrl: "/" })}
                          >
                            <LogOut className="size-4" />
                            Logout
                          </Button>
                        </DrawerClose>
                      ) : (
                        <DrawerClose asChild>
                          <Button
                            asChild
                            className="bg-primary-800 hover:bg-primary-700 h-11 w-full justify-start gap-2 rounded-xl text-white"
                          >
                            <Link href="/signin">
                              <LogIn className="size-4" />
                              Sign in / Register
                            </Link>
                          </Button>
                        </DrawerClose>
                      )}
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
                              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                isActive
                                  ? "bg-slate-100 text-slate-900"
                                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              }`}
                            >
                              <Icon className="size-4 text-slate-400 transition group-hover:text-slate-700" />
                              <span className="flex-1">{link.label}</span>
                              {link.badge && (
                                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
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
                            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
                          >
                            <ShieldCheck className="size-4 text-slate-700" />
                            Admin dashboard
                          </Link>
                        </DrawerClose>
                      )}
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

              <CartDrawer autoOpenViewport="mobile" />
            </div>
          </div>

          <div className="pb-4 lg:hidden">
            <Suspense fallback={searchFallback}>
              <SearchBar />
            </Suspense>
          </div>

          <div className="hidden lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-6 lg:py-4">
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

                <CartDrawer autoOpenViewport="desktop" />
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
