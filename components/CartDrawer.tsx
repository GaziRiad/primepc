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
import { useEffect, useState } from "react";

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
};

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const {
    cartItems,
    itemsCount,
    removeFromCart,
    addToCart,
    decrementFromCart,
  } = useCart();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      <DrawerContent className="flex h-dvh flex-col px-5 py-6 sm:px-8 sm:py-8">
        <DrawerHeader className="mb-6 grid grid-cols-2 items-center justify-between border-b sm:mb-10">
          <DrawerTitle className="text-accent text-2xl font-semibold">
            Cart View
          </DrawerTitle>
          <DrawerClose className="text-foreground w-fit justify-self-end bg-transparent hover:bg-transparent focus:ring-0">
            <X className="size-6" />
          </DrawerClose>
        </DrawerHeader>

        <div className="mx-2 flex-1 overflow-y-auto sm:mx-6">
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
                const stock =
                  typeof item.product.stock === "number"
                    ? item.product.stock
                    : undefined;
                const canIncrease =
                  typeof stock === "number" ? item.quantity < stock : true;

                return (
                  <li key={productId}>
                    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 font-medium md:grid-cols-[20fr_60fr_20fr] md:gap-6">
                      <div className="relative flex aspect-square size-16 overflow-hidden rounded-lg sm:size-20 md:size-22">
                        <Image
                          fill
                          src={
                            item.product.coverImage ?? "/images/accessories.png"
                          }
                          alt={`Image of ${item.product.name ?? "cart product"} from PRIMEPC algeria.`}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="text-primary-700 truncate text-base capitalize">
                          {item.product.name ?? "Unknown product"}
                        </p>
                        <p className="text-primary-700 text-sm">
                          {formatDZD(item.product.finalPrice ?? 0)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => decrementFromCart(productId)}
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
                              addToCart(productId, {
                                name: item.product.name,
                                coverImage: item.product.coverImage,
                                finalPrice: item.product.finalPrice,
                                stock: item.product.stock,
                              })
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
                        onClick={() => removeFromCart(productId)}
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

        <div className="mt-6 border-t px-5 pt-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-accent text-xl font-semibold">Subtotal:</p>
            <p className="text-primary-800 text-2xl font-semibold">
              {formatDZD(subtotal)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <DrawerClose asChild>
              <Button
                asChild
                className="bg-primary-400 hover:bg-primary-500 h-12 rounded-full text-white"
              >
                <Link href="/cart">View Cart</Link>
              </Button>
            </DrawerClose>

            <DrawerClose asChild>
              <Button
                asChild
                className="bg-primary-800 hover:bg-primary-700 h-12 rounded-full text-white"
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
