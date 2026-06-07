"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { formatDZD } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const OPEN_CART_EVENT = "primepc:open-cart";
const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

type TCartDrawerItem = {
  product: {
    _id: string;
    id?: string;
    name?: string;
    coverImage?: string;
    finalPrice?: number;
    stock?: number;
  };
  quantity: number;
  variantId?: string;
  variantLabel?: string;
  variantOptions?: Array<{ name: string; value: string }>;
};

type CartDrawerProps = {
  autoOpenViewport?: "mobile" | "desktop";
};

export default function CartDrawer({ autoOpenViewport }: CartDrawerProps) {
  const pathname = usePathname();
  const [drawerState, setDrawerState] = useState({
    pathname,
    open: false,
  });
  const open = drawerState.pathname === pathname ? drawerState.open : false;
  const setOpen = useCallback(
    (nextOpen: boolean) => {
      setDrawerState({ pathname, open: nextOpen });
    },
    [pathname],
  );
  const {
    cartItems,
    itemsCount,
    removeFromCart,
    addToCart,
    decrementFromCart,
  } = useCart();

  useEffect(() => {
    const handleOpenCart = () => {
      if (autoOpenViewport) {
        const isDesktop = window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
        const shouldOpen =
          autoOpenViewport === "desktop" ? isDesktop : !isDesktop;

        if (!shouldOpen) return;
      }

      setOpen(true);
    };

    window.addEventListener(OPEN_CART_EVENT, handleOpenCart);

    return () => {
      window.removeEventListener(OPEN_CART_EVENT, handleOpenCart);
    };
  }, [autoOpenViewport, setOpen]);

  const subtotal = cartItems.reduce(
    (sum: number, item: TCartDrawerItem) =>
      sum + (item.product.finalPrice ?? 0) * (item.quantity ?? 0),
    0,
  );

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger className="relative cursor-pointer">
        <ShoppingCart className="stroke-1" />
        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-1 py-0 text-[10px] text-white">
          {itemsCount || 0}
        </span>
      </DrawerTrigger>
      <DrawerContent className="flex h-dvh flex-col px-4 py-5 sm:px-8 sm:py-8">
        <DrawerHeader className="mb-5 grid grid-cols-[1fr_auto] items-center justify-between border-b px-0 pb-4 sm:mb-10">
          <DrawerTitle className="text-accent text-xl font-semibold whitespace-nowrap sm:text-2xl">
            Cart View
          </DrawerTitle>
          <DrawerClose className="text-foreground w-fit justify-self-end bg-transparent hover:bg-transparent focus:ring-0">
            <X className="size-6" />
          </DrawerClose>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto sm:mx-6">
          {cartItems.length === 0 ? (
            <div className="text-accent-300 flex h-full flex-col items-center justify-center gap-6 text-sm">
              <div className="relative flex aspect-square h-32 max-w-32 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                <ShoppingCart className="stroke-[1.5px]" size={32} />
              </div>
              <span className="text-lg">Your cart is empty.</span>
            </div>
          ) : (
            <ul className="flex flex-col gap-8 pb-4">
              {cartItems?.map((item: TCartDrawerItem) => {
                const productId = String(item.product?._id ?? item.product?.id);
                const variantId = String(item.variantId ?? "");
                const stock =
                  typeof item.product.stock === "number"
                    ? item.product.stock
                    : undefined;
                const canIncrease =
                  typeof stock === "number" ? item.quantity < stock : true;

                return (
                  <li key={`${productId}:${variantId}`}>
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 font-medium md:grid-cols-[20fr_60fr_20fr] md:gap-6">
                      <div className="relative flex aspect-square size-16 overflow-hidden rounded-lg sm:size-20 md:size-22">
                        <Image
                          fill
                          src={
                            item.product.coverImage ?? "/images/accessories.png"
                          }
                          alt={`Image of ${item.product.name ?? "cart product"} from PRIMEPC algeria.`}
                          className="object-cover"
                          unoptimized={/^https?:\/\//i.test(
                            item.product.coverImage ?? "",
                          )}
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="text-primary-700 truncate text-base capitalize">
                          {item.product.name ?? "Unknown product"}
                        </p>
                        <p className="text-primary-700 text-sm">
                          {formatDZD(item.product.finalPrice ?? 0)}
                        </p>
                        {item.variantLabel && (
                          <p className="text-muted-foreground text-xs">
                            {item.variantLabel}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              decrementFromCart(productId, variantId)
                            }
                            variant="secondary"
                            className="hover:bg-accent-100 flex h-8 w-8 items-center justify-center rounded-full"
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              addToCart(
                                productId,
                                {
                                  name: item.product.name,
                                  coverImage: item.product.coverImage,
                                  finalPrice: item.product.finalPrice,
                                  stock: item.product.stock,
                                },
                                variantId
                                  ? {
                                      id: variantId,
                                      label: item.variantLabel,
                                      options: item.variantOptions,
                                    }
                                  : undefined,
                              )
                            }
                            variant="secondary"
                            disabled={!canIncrease}
                            className="hover:bg-accent-100 flex h-8 w-8 items-center justify-center rounded-full"
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                      </div>

                      <Button
                        type="button"
                        aria-label="Remove item from cart"
                        onClick={() => removeFromCart(productId, variantId)}
                        variant="secondary"
                        className="hover:bg-destructive/5 hover:text-destructive/60 flex h-11 w-11 items-center justify-center rounded-full"
                      >
                        <Trash2 className="size-5 stroke-[1.5px]" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-5 border-t pt-5 sm:mt-6 sm:px-5 sm:pt-6">
          <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
            <p className="text-accent text-lg font-semibold sm:text-xl">
              Subtotal:
            </p>
            <p className="text-primary-800 text-xl font-semibold sm:text-2xl">
              {formatDZD(subtotal)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <DrawerClose asChild>
              <Button
                asChild
                className="bg-primary-400 hover:bg-primary-500 h-11 rounded-full px-3 text-xs whitespace-nowrap text-white sm:h-12 sm:px-4 sm:text-sm"
              >
                <Link href="/cart">View Cart</Link>
              </Button>
            </DrawerClose>

            <DrawerClose asChild>
              <Button
                asChild
                className="bg-primary-800 hover:bg-primary-700 h-11 rounded-full px-3 text-xs whitespace-nowrap text-white sm:h-12 sm:px-4 sm:text-sm"
              >
                <Link href="/checkout">Checkout</Link>
              </Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
