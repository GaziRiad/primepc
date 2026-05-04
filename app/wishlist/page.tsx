"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
          <Table className="mx-auto w-full max-w-7xl min-w-180 border">
            <TableCaption>Your wishlist</TableCaption>
            <TableHeader className="">
              <TableRow className="">
                <TableHead className="w-24" />
                <TableHead className="">Product</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {favProducts?.map((item, index) => {
                const inStock = Number(item.product.stock ?? 0) > 0;

                return (
                  <TableRow
                    key={index}
                    className="hover:bg-accent-100 bg-white"
                  >
                    <TableCell align="center">
                      <Button
                        onClick={() =>
                          toggleFavorite(item.product._id.toString())
                        }
                        variant="secondary"
                        className="hover:bg-destructive/5 hover:text-destructive/60 flex h-8 w-8 items-center justify-center rounded-full"
                      >
                        <CircleX className="size-4 stroke-[1.5px]" />
                      </Button>
                    </TableCell>
                    <TableCell className="flex w-1/2 items-center gap-6 font-medium">
                      <div className="relative flex aspect-square h-18 max-w-18 overflow-hidden rounded-lg">
                        <Image
                          fill
                          src={item.product.coverImage}
                          alt={`Image of ${item.product.name} from PRIMEPC algeria.`}
                          className="object-cover"
                        />
                      </div>
                      <span>{item.product.name}</span>
                    </TableCell>
                    <TableCell>{formatDZD(item.product.finalPrice)}</TableCell>
                    <TableCell
                      className={inStock ? "text-green-500" : "text-red-500"}
                    >
                      <div className="flex items-center gap-2">
                        {inStock ? (
                          <CircleCheck className="size-5 stroke-1" />
                        ) : (
                          <CircleX className="size-5 stroke-1" />
                        )}
                        <span>{inStock ? "In Stock" : "Out of Stock"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AddToCartButton
                        productId={String(item.product._id)}
                        product={{
                          name: item.product.name,
                          coverImage: item.product.coverImage,
                          finalPrice: item.product.finalPrice,
                          stock: item.product.stock,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
