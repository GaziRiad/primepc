"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { toggleFavoritesAction } from "@/lib/actions";
import { fetcher } from "@/lib/utils";
import type { TFavoriteApiItem } from "@/types/types";

const FAVORITES_KEY = "/api/favorites";

const swrOptions = {
  refreshInterval: 0,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};

const getId = (item: TFavoriteApiItem) => String(item?.product?._id ?? "");

export function useFavorites() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const {
    data = [],
    mutate,
    isLoading,
  } = useSWR<TFavoriteApiItem[]>(FAVORITES_KEY, fetcher, swrOptions);

  const isFavorite = (productId: string) =>
    data.some((item) => getId(item) === productId);

  const toggleList = (current: TFavoriteApiItem[] = [], productId: string) =>
    current.some((i) => getId(i) === productId)
      ? current.filter((i) => getId(i) !== productId)
      : [
          ...current,
          { product: { _id: productId } as TFavoriteApiItem["product"] },
        ];

  const toggleFavorite = async (productId: string) => {
    if (!isAuthenticated) {
      toast.error("Sign in to save favorites.");
      return;
    }

    await mutate(
      async (current = []) => {
        const currentlyFav = current.some((i) => getId(i) === productId);
        const result = await toggleFavoritesAction(productId);
        if (!result?.ok) {
          if (result?.reason === "unauthenticated") {
            toast.error("Sign in to save favorites.");
          } else {
            toast.error("Unable to update favorites.");
          }
          throw new Error(result?.reason ?? "failed");
        }
        toast.success(
          currentlyFav
            ? "Product removed from favorites"
            : "Product added to favorites",
        );
        return toggleList(current, productId);
      },
      {
        optimisticData: (current = []) => toggleList(current, productId),
        rollbackOnError: true,
        revalidate: true,
      },
    );
  };

  return {
    favorites: data,
    favoritesCount: data.length,
    isLoading,
    isFavorite,
    toggleFavorite,
  };
}
