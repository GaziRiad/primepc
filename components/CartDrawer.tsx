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
import { ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { formatDZD } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";

type TCartDrawerItem = {
  product: {
    _id: string;
    id?: string;
    name?: string;
    coverImage?: string;
    finalPrice?: number;
  };
  quantity: number;
};

export default function CartDrawer() {
  const { cartItems, itemsCount, removeFromCart } = useCart();

  const subtotal = cartItems.reduce(
    (sum: number, item: TCartDrawerItem) =>
      sum + (item.product.finalPrice ?? 0) * (item.quantity ?? 0),
    0,
  );

  return (
    <Drawer direction="right">
      <DrawerTrigger className="relative cursor-pointer">
        <ShoppingCart className="stroke-1" />
        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-1 py-0 text-[10px] text-white">
          {itemsCount || 0}
        </span>
      </DrawerTrigger>
      <DrawerContent className="flex h-dvh flex-col px-8 py-8">
        <DrawerHeader className="mb-10 grid grid-cols-2 items-center justify-between border-b">
          <DrawerTitle className="text-accent text-2xl font-semibold">
            Cart View
          </DrawerTitle>
          <DrawerClose className="text-foreground w-fit justify-self-end bg-transparent hover:bg-transparent focus:ring-0">
            <X className="size-6" />
          </DrawerClose>
        </DrawerHeader>

        <div className="mx-6 flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="text-accent-300 flex h-full flex-col items-center justify-center gap-6 text-sm">
              <div className="relative flex aspect-square h-32 max-w-32 items-center justify-center overflow-hidden rounded-full bg-zinc-100">
                <ShoppingCart className="stroke-[1.5px]" size={32} />
              </div>
              <span className="text-lg">Your cart is empty.</span>
            </div>
          ) : (
            <ul className="flex flex-col gap-8 pb-4">
              {cartItems?.map((item: TCartDrawerItem) => (
                <li key={String(item.product?._id ?? item.product?.id)}>
                  <div className="grid grid-cols-[20fr_60fr_20fr] items-center gap-6 font-medium">
                    <div className="relative flex aspect-square size-22 overflow-hidden rounded-lg">
                      <Image
                        fill
                        src={
                          item.product.coverImage ?? "/images/accessories.png"
                        }
                        alt={`Image of ${item.product.name ?? "cart product"} from PRIMEPC algeria.`}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-primary-700 flex items-center gap-2 text-base capitalize">
                        <span>{item.product.name ?? "Unknown product"}</span>
                        <span>({item.quantity})</span>
                      </p>

                      <p className="font-light">
                        <span>Qty: </span>
                        <span>{item.quantity}</span>
                      </p>
                      <p className="text-primary-700 text-sm">
                        {formatDZD(item.product.finalPrice ?? 0)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={() =>
                        removeFromCart(
                          String(item.product?._id ?? item.product?.id),
                        )
                      }
                      variant="secondary"
                      className="hover:bg-destructive/5 hover:text-destructive/60 flex h-11 w-11 items-center justify-center rounded-full"
                    >
                      <Trash2 className="size-5 stroke-[1.5px]" />
                    </Button>
                  </div>
                </li>
              ))}
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
            <Button
              asChild
              className="bg-primary-400 hover:bg-primary-500 h-12 rounded-full text-white"
            >
              <Link href="/cart">View Cart</Link>
            </Button>

            <Button
              asChild
              className="bg-primary-800 hover:bg-primary-700 h-12 rounded-full text-white"
            >
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
