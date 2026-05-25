"use client";

import Image from "next/image";
import Link from "next/link";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/(user)/FavoriteButton";
import { formatDZD } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

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
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const lastIndexRef = useRef(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);

  const safeIndex = activeIndex >= gallery.length ? 0 : activeIndex;
  const activeImage = gallery[safeIndex] ?? gallery[0];
  const inStock = Number(stock ?? 0) > 0;

  const updateActiveIndex = (nextIndex: number) => {
    if (nextIndex !== lastIndexRef.current) {
      lastIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
  };

  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      updateActiveIndex(carouselApi.selectedScrollSnap());
    };

    handleSelect();
    carouselApi.on("select", handleSelect);
    carouselApi.on("reInit", handleSelect);

    return () => {
      carouselApi.off("select", handleSelect);
      carouselApi.off("reInit", handleSelect);
    };
  }, [carouselApi]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (gallery.length <= 1 || !imageContainerRef.current) {
      return;
    }

    const { left, width } = imageContainerRef.current.getBoundingClientRect();
    if (width <= 0) {
      return;
    }

    const x = Math.min(Math.max(event.clientX - left, 0), width - 1);
    const segment = width / gallery.length;
    const nextIndex = Math.min(gallery.length - 1, Math.floor(x / segment));
    updateActiveIndex(nextIndex);
  };

  const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
    handleMouseMove(event);
  };

  const handleMouseLeave = () => {
    lastIndexRef.current = 0;
    setActiveIndex(0);
  };

  return (
    <Card
      size={!large ? "sm" : "default"}
      className={`h-full py-10 transition-all ${
        large ? "hover:shadow-lg" : "rounded-sm hover:shadow-md"
      } `}
    >
      <CardContent className="flex w-full flex-col items-center">
        <div className="w-full">
          <div className="sm:hidden">
            <Carousel
              opts={{ loop: gallery.length > 1, align: "start" }}
              setApi={setCarouselApi}
              className="touch-pan-y"
            >
              <CarouselContent>
                {gallery.map((image, index) => (
                  <CarouselItem key={`mobile-image-${index}`}>
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-100">
                      <Image
                        fill
                        src={image}
                        alt={`Image of ${name} from PRIMEPC algeria.`}
                        className="object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {gallery.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {gallery.map((_, index) => (
                  <span
                    key={`mobile-dot-${index}`}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      index === safeIndex ? "bg-zinc-900" : "bg-zinc-900/20"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div
            ref={imageContainerRef}
            className="group/image relative hidden aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 sm:flex"
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <Image
              fill
              src={activeImage}
              alt={`Image of ${name} from PRIMEPC algeria.`}
              className="object-cover transition-transform duration-300 ease-out group-hover/image:scale-[1.02]"
            />

            {gallery.length > 1 && (
              <div className="pointer-events-none absolute inset-x-4 bottom-4 flex gap-1 opacity-0 transition-opacity group-hover/image:opacity-100">
                {gallery.map((_, index) => (
                  <span
                    key={`progress-${index}`}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index === safeIndex ? "bg-zinc-900/80" : "bg-zinc-900/20"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex h-full flex-col items-start">
        <p className="text-accent-400 -mb-1 text-xs uppercase">{brand}</p>
        <Link
          href={`/products/${slug}`}
          className="mb-2 line-clamp-2 min-h-10 text-sm font-medium underline-offset-2 transition-all hover:underline"
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
