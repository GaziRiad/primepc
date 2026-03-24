"use client";

import { useFavorites } from "@/hooks/useFavorites";
import { toggleFavoritesAction } from "@/lib/actions";
import { fetcher } from "@/lib/utils";
import { TFavoriteApiItem, TProduct } from "@/types/types";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import useSWR from "swr";

export default function FavoriteButton({
  productId,
  large = false,
}: {
  productId: string;
  large?: boolean;
}) {
  // const { data: favProducts = [], mutate } = useSWR<TFavoriteApiItem[]>(
  //   "/api/favorites",
  //   fetcher,
  //   {
  //     refreshInterval: 2000,
  //     revalidateOnFocus: true,
  //     revalidateOnReconnect: true,
  //   },
  // );

  // const getId = (item: TFavoriteApiItem) => String(item?.product?._id ?? "");

  // const fav = favProducts.some((item) => getId(item) === productId);

  // const toggleList = (current: TFavoriteApiItem[] = []) =>
  //   current.some((i) => getId(i) === productId)
  //     ? current.filter((i) => getId(i) !== productId)
  //     : [...current, { product: { _id: productId } as TProduct }];

  // const onToggle = async () => {
  //   await mutate(
  //     async (current: TFavoriteApiItem[] = []) => {
  //       const currentlyFav = current.some((i) => getId(i) === productId);

  //       await toggleFavoritesAction(productId);

  //       if (currentlyFav) {
  //         toast.error("Product removed from favorites");
  //       } else {
  //         toast.success("Product added to favorites");
  //       }

  //       return toggleList(current);
  //     },
  //     {
  //       optimisticData: (current: TFavoriteApiItem[] = []) =>
  //         toggleList(current),
  //       rollbackOnError: true,
  //       revalidate: true,
  //     },
  //   );
  // };

  const { isFavorite, toggleFavorite } = useFavorites();

  const fav = isFavorite(productId);

  return (
    <Heart
      onClick={() => toggleFavorite(productId)}
      className={`hover:color-red-600 cursor-pointer stroke-1 transition-all hover:fill-red-600 hover:stroke-red-600 ${fav ? "fill-red-600 stroke-red-600" : ""} ${large ? "" : "size-5"}`}
    />
  );
}
