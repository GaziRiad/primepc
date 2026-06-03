"use client";

import { useTransition } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "./ui/button";

const OPEN_CART_EVENT = "primepc:open-cart";

type AddToCartButtonProps = {
  productId: string;
  product: {
    name: string;
    coverImage: string;
    finalPrice: number;
    stock?: number;
  };
  large?: boolean;
};

export default function AddToCartButton({
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
      className="cursor-pointer"
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
            window.dispatchEvent(new Event(OPEN_CART_EVENT));
          }
        });
      }}
    >
      {label}
    </Button>
  );
}
