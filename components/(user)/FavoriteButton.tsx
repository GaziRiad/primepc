"use client";

import { toggleFavoritesAction } from "@/lib/actions";
import { Heart } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function FavoriteButton({
  productId,
  large = false,
}: {
  productId: string;
  large?: boolean;
}) {
  const {
    data: ids = [],
    mutate,
    isLoading,
  } = useSWR<string[]>("/api/favorites", fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const fav = ids.length ? ids.includes(productId) : false;

  const onToggle = async () => {
    await mutate(
      async (current = []) => {
        await toggleFavoritesAction(productId);
        return current.includes(productId)
          ? current.filter((id) => id !== productId)
          : [...current, productId];
      },
      {
        optimisticData: (current = []) =>
          current.includes(productId)
            ? current.filter((id) => id !== productId)
            : [...current, productId],
        rollbackOnError: true,
        revalidate: true,
      },
    );
  };

  return (
    <Heart
      onClick={onToggle}
      className={`hover:color-red-600 cursor-pointer stroke-1 transition-all hover:fill-red-600 hover:stroke-red-600 ${fav ? "fill-red-600 stroke-red-600" : ""} ${large ? "" : "size-5"}`}
    />
  );
}
