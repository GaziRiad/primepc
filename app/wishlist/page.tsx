"use client";

import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";
import { formatDZD } from "@/lib/utils";
import { CircleCheck, CircleX } from "lucide-react";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";

export default function WishlistPage() {
  const { favorites: favProducts, toggleFavorite } = useFavorites();

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-accent text-2xl font-semibold">My Wishlist</h2>
      </div>

      <section className="bg-accent-50 px-4 py-14 sm:px-6 lg:px-8">
        {favProducts.length === 0 && (
          <p className="mx-auto min-h-80 max-w-7xl text-center text-xl">
            Your Wishlist is empty!
          </p>
        )}
        {favProducts.length > 0 && (
          <>
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
              {favProducts.map((item, index) => {
                const inStock = Number(item.product.stock ?? 0) > 0;

                return (
                  <div
                    key={`${item.product._id}-${index}`}
                    className="rounded-xl border bg-white p-4 shadow-xs"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative flex aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          fill
                          src={item.product.coverImage}
                          alt={`Image of ${item.product.name} from PRIMEPC algeria.`}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground line-clamp-2 text-sm font-semibold">
                          {item.product.name}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {formatDZD(item.product.finalPrice)}
                        </p>
                        <div
                          className={`mt-2 inline-flex items-center gap-2 text-xs ${
                            inStock ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {inStock ? (
                            <CircleCheck className="size-4 stroke-1" />
                          ) : (
                            <CircleX className="size-4 stroke-1" />
                          )}
                          <span>{inStock ? "In Stock" : "Out of Stock"}</span>
                        </div>
                      </div>
                      <Button
                        onClick={() =>
                          toggleFavorite(item.product._id.toString())
                        }
                        variant="secondary"
                        className="hover:bg-destructive/5 hover:text-destructive/60 h-8 w-8 rounded-full"
                      >
                        <CircleX className="size-4 stroke-[1.5px]" />
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center justify-end">
                      <AddToCartButton
                        productId={String(item.product._id)}
                        product={{
                          name: item.product.name,
                          coverImage: item.product.coverImage,
                          finalPrice: item.product.finalPrice,
                          stock: item.product.stock,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
