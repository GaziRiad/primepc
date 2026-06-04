"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

export default function FavoriteButton({
  className,
  productId,
  large = false,
}: {
  className?: string;
  productId: string;
  large?: boolean;
}) {
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();

  const fav = isFavorite(productId);

  return (
    <button
      type="button"
      onClick={() => {
        if (isLoading) return;
        toggleFavorite(productId);
      }}
      disabled={isLoading}
      aria-pressed={fav}
      aria-label={fav ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-full transition-all disabled:pointer-events-none disabled:opacity-50",
        large ? "size-9" : "size-8",
        className,
      )}
    >
      <Heart
        className={cn(
          "stroke-1 transition-all hover:fill-red-600 hover:stroke-red-600",
          fav ? "fill-red-600 stroke-red-600" : "",
          large ? "size-5" : "size-5",
        )}
      />
    </button>
  );
}
