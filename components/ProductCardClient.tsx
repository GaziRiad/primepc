"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/(user)/FavoriteButton";
import { formatDZD } from "@/lib/utils";

const FALLBACK_IMAGE = "/images/accessories.png";

type ProductCardClientProps = {
  productId: string;
  name: string;
  brand?: string;
  slug: string;
  coverImage: string;
  images?: string[];
  price: number;
  finalPrice: number;
  discount?: number;
  stock?: number;
  large?: boolean;
};

export default function ProductCardClient({
  productId,
  name,
  brand,
  slug,
  coverImage,
  images,
  price,
  finalPrice,
  discount = 0,
  stock,
  large = false,
}: ProductCardClientProps) {
  const gallery = useMemo(() => {
    const cleaned = [coverImage, ...(images ?? [])]
      .map((image) => image.trim())
      .filter((image) => image.length > 0);
    return cleaned.length > 0 ? cleaned : [FALLBACK_IMAGE];
  }, [coverImage, images]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= gallery.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, gallery.length]);

  const activeImage = gallery[activeIndex] ?? gallery[0];
  const inStock = Number(stock ?? 0) > 0;
  const thumbs = gallery.slice(0, large ? 5 : 4);

  return (
    <Card
      size={!large ? "sm" : "default"}
      className={`h-full py-10 transition-all ${
        large ? "hover:shadow-lg" : "rounded-sm hover:shadow-md"
      } `}
    >
      <CardContent className="flex flex-col items-center">
        <div className="relative flex aspect-square w-11/12 sm:w-4/5">
          <Image
            fill
            src={activeImage}
            alt={`Image of ${name} from PRIMEPC algeria.`}
            className="object-cover"
          />
        </div>

        {thumbs.length > 1 && (
          <ul
            className={`mt-4 grid w-11/12 gap-3 sm:w-4/5 ${
              large
                ? "grid-cols-4 sm:grid-cols-5"
                : "grid-cols-3 sm:grid-cols-4"
            }`}
            onMouseLeave={() => setActiveIndex(0)}
          >
            {thumbs.map((thumb, index) => {
              const isActive = index === activeIndex;

              return (
                <li key={`thumb-${index}`}>
                  <button
                    type="button"
                    aria-label={`View image ${index + 1} for ${name}`}
                    aria-pressed={isActive}
                    onMouseEnter={() => setActiveIndex(index)}
                    onFocus={() => setActiveIndex(index)}
                    className={`relative aspect-square w-full overflow-hidden rounded-sm border bg-white transition ${
                      isActive
                        ? "border-primary/40 ring-primary/40 ring-2"
                        : "hover:border-primary/30"
                    }`}
                  >
                    <Image
                      fill
                      src={thumb}
                      alt={`Thumbnail ${index + 1} of ${name}`}
                      className="object-cover"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <CardFooter className="flex h-full flex-col items-start">
        <p className="text-accent-400 -mb-1 text-xs uppercase">{brand}</p>
        <Link
          href={`/products/${slug}`}
          className="mb-2 underline-offset-2 transition-all hover:underline"
        >
          {name}
        </Link>

        {large && (
          <Badge className="mb-2 bg-amber-400" variant="default">
            Latest & Greatest
          </Badge>
        )}

        <div
          className={`mb-4 flex gap-0 ${
            large ? "flex-row gap-2" : "flex-col gap-0"
          }`}
        >
          <p className="text-base font-semibold">{formatDZD(finalPrice)}</p>
          {discount > 0 && (
            <div className="flex items-center gap-2">
              <p className="text-accent-300 text-sm line-through">
                {formatDZD(price)}
              </p>
              <Badge variant="secondary">-{discount}%</Badge>
            </div>
          )}
        </div>

        <p
          className={`mb-4 text-xs font-semibold ${
            inStock ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {inStock ? "In Stock" : "Out of Stock"}
        </p>

        <div className="mt-auto flex items-center gap-2">
          <AddToCartButton
            productId={productId}
            product={{
              name,
              coverImage: activeImage,
              finalPrice,
              stock,
            }}
            large={large}
          />
          <FavoriteButton productId={productId} large={large} />
        </div>
      </CardFooter>
    </Card>
  );
}
