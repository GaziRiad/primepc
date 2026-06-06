"use client";

import { useTransition } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { trackProductAnalytics } from "@/lib/analyticsClient";

const OPEN_CART_EVENT = "primepc:open-cart";

type AddToCartButtonProps = {
  className?: string;
  productId: string;
  product: {
    name: string;
    coverImage: string;
    finalPrice: number;
    slug?: string;
    stock?: number;
  };
  large?: boolean;
};

export default function AddToCartButton({
  className,
  productId,
  product,
  large = false,
}: AddToCartButtonProps) {
  const { addToCart, cartItems } = useCart();
  const [isPending, startTransition] = useTransition();
  const stock = typeof product.stock === "number" ? product.stock : undefined;
  const currentQty =
    cartItems.find(
      (item) =>
        String(item.product?._id ?? item.product?.id ?? "") === productId,
    )?.quantity ?? 0;
  const isOutOfStock = typeof stock === "number" && stock <= 0;
  const isMaxed = typeof stock === "number" && currentQty >= stock;
  const isDisabled = isPending || isOutOfStock || isMaxed;
  const label = isOutOfStock
    ? "Out of stock"
    : isMaxed
      ? "Max in cart"
      : "Add to cart";

  return (
    <Button
      type="button"
      size={large ? "default" : "sm"}
      className={cn("cursor-pointer", className)}
      disabled={isDisabled}
      onClick={() => {
        startTransition(async () => {
          const added = await addToCart(productId, {
            _id: productId,
            name: product.name,
            coverImage: product.coverImage,
            finalPrice: product.finalPrice,
            stock: product.stock,
          });

          if (added) {
            trackProductAnalytics({
              product: {
                coverImage: product.coverImage,
                finalPrice: product.finalPrice,
                name: product.name,
                slug: product.slug,
              },
              productId,
              quantity: 1,
              type: "add_to_cart",
              value: product.finalPrice,
            });
            window.dispatchEvent(new Event(OPEN_CART_EVENT));
          }
        });
      }}
    >
      {label}
    </Button>
  );
}
