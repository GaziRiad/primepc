"use client";

import { useTransition } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "./ui/button";

type AddToCartButtonProps = {
  productId: string;
  product: {
    name: string;
    coverImage: string;
    finalPrice: number;
  };
  large?: boolean;
};

export default function AddToCartButton({
  productId,
  product,
  large = false,
}: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size={large ? "default" : "sm"}
      className="cursor-pointer"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await addToCart(productId, {
            _id: productId,
            name: product.name,
            coverImage: product.coverImage,
            finalPrice: product.finalPrice,
          });
        });
      }}
    >
      Add to cart
    </Button>
  );
}
