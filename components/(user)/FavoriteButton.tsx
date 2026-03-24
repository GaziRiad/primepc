"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { Heart } from "lucide-react";

export default function FavoriteButton({
  productId,
  large = false,
}: {
  productId: string;
  large?: boolean;
}) {
  const { isFavorite, toggleFavorite, isLoading } = useFavorites();

  const fav = isFavorite(productId);

  return (
    <Heart
      onClick={() => {
        if (isLoading) return;
        toggleFavorite(productId);
      }}
      aria-disabled={isLoading}
      className={`hover:color-red-600 cursor-pointer stroke-1 transition-all hover:fill-red-600 hover:stroke-red-600 ${fav ? "fill-red-600 stroke-red-600" : ""} ${large ? "" : "size-5"} `}
    />
  );
}
