"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/hooks/useCart";
import { formatDZD } from "@/lib/utils";

const SHIPPING_THRESHOLD = 40000;
const SHIPPING_FEE = 500;

export default function CartPage() {
  const { cartItems, isLoading, addToCart, decrementFromCart, removeFromCart } =
    useCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.finalPrice ?? 0) * item.quantity,
    0,
  );

  const shipping =
    subtotal >= SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  const handleClearCart = async () => {
    for (const item of cartItems) {
      const rawId = item.product?._id ?? item.product?.id;
      const productId = rawId ? String(rawId) : "";
      if (!productId) continue;
      await removeFromCart(productId);
    }
  };

  const hasItems = cartItems.length > 0;

  return (
    <div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <h2 className="text-accent text-xl font-semibold sm:text-2xl">
          Your Cart
        </h2>
        {hasItems && (
          <Button
            variant="link"
            className="h-auto border-0 p-0 text-xs font-normal no-underline! sm:text-sm"
            onClick={handleClearCart}
          >
            Clear Shopping Cart
          </Button>
        )}
      </div>

      <section className="bg-accent-50 py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="flex min-h-40 items-center justify-center rounded-xl border-[0.5px] bg-white shadow-xs">
              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                <Spinner className="size-5" />
                Loading your cart...
              </div>
            </div>
          )}

          {!isLoading && !hasItems && (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-xl border-[0.5px] bg-white shadow-xs">
              <p className="text-muted-foreground text-lg">
                Your cart is empty.
              </p>
              <Button
                asChild
                className="bg-primary-800 hover:bg-primary-700 h-11 rounded-full text-white"
              >
                <Link href="/products">Browse products</Link>
              </Button>
            </div>
          )}

          {!isLoading && hasItems && (
            <div className="rounded-xl border-[0.5px] bg-white shadow-xs">
              <Table className="w-full min-w-180">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[45%]">Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cartItems.map((item, index) => {
                    const rawId = item.product?._id ?? item.product?.id;
                    const productId = rawId ? String(rawId) : "";
                    const canInteract = Boolean(productId);
                    const price = item.product.finalPrice ?? 0;
                    const stock =
                      typeof item.product.stock === "number"
                        ? item.product.stock
                        : undefined;
                    const canIncrease =
                      canInteract &&
                      (typeof stock === "number"
                        ? item.quantity < stock
                        : true);

                    return (
                      <TableRow
                        key={`${productId || "item"}-${index}`}
                        className="bg-white"
                      >
                        <TableCell className="whitespace-normal">
                          <div className="flex items-center gap-4">
                            <div className="relative flex aspect-square h-16 w-16 overflow-hidden rounded-lg bg-zinc-100">
                              <Image
                                fill
                                src={
                                  item.product.coverImage ??
                                  "/images/accessories.png"
                                }
                                alt={`Image of ${item.product.name ?? "cart product"} from PRIMEPC algeria.`}
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-primary-700 text-sm font-medium">
                                {item.product.name ?? "Unknown product"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDZD(price)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                canInteract && decrementFromCart(productId)
                              }
                              variant="secondary"
                              disabled={!canInteract}
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
                                canInteract &&
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
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatDZD(price * item.quantity)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            aria-label="Remove item from cart"
                            onClick={() =>
                              canInteract && removeFromCart(productId)
                            }
                            variant="secondary"
                            disabled={!canInteract}
                            className="hover:bg-destructive/5 hover:text-destructive/60 h-9 w-9 rounded-full"
                          >
                            <Trash2 className="size-4 stroke-[1.5px]" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {!isLoading && hasItems && (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
                <h3 className="text-accent text-lg font-semibold">
                  Have a discount code?
                </h3>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Input
                    placeholder="Enter coupon code"
                    className="h-11 rounded-full"
                  />
                  <Button
                    className="bg-primary-400 hover:bg-primary-500 h-11 rounded-full px-6 text-white"
                    type="button"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
                <h3 className="text-accent text-lg font-semibold">
                  Order Summary
                </h3>
                <div className="mt-4 border-y border-dashed py-4">
                  <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-wide uppercase">
                    <span>Product</span>
                    <span>Total</span>
                  </div>
                  <ul className="mt-3 flex flex-col gap-3 text-sm">
                    {cartItems.map((item, index) => {
                      const rawId = item.product?._id ?? item.product?.id;
                      const productId = rawId ? String(rawId) : "";
                      const price = item.product.finalPrice ?? 0;
                      const total = price * item.quantity;

                      return (
                        <li
                          key={`${productId || "item"}-${index}`}
                          className="flex items-start justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-primary-700 line-clamp-1 font-medium">
                              {item.product.name ?? "Unknown product"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              x{item.quantity}
                            </p>
                          </div>
                          <span className="font-semibold">
                            {formatDZD(total)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="mt-5 flex flex-col gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatDZD(subtotal)}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : formatDZD(shipping)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4 text-base">
                    <span className="font-semibold">Total</span>
                    <span className="text-primary-800 font-semibold">
                      {formatDZD(total)}
                    </span>
                  </div>
                </div>

                <Button
                  asChild
                  className="bg-primary-800 hover:bg-primary-700 mt-6 h-12 w-full rounded-full text-white"
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
