"use client";

import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  badge?: boolean;
  hasVariants?: boolean;
  topSeller?: boolean;
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
  badge,
  hasVariants = false,
  topSeller = false,
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
      className={`h-full min-w-0 py-10 transition-all ${
        large ? "hover:shadow-lg" : "rounded-sm hover:shadow-md"
      } `}
    >
      <CardContent className="flex w-full flex-col items-center px-2.5!">
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
                    <Link
                      href={`/products/${slug}`}
                      aria-label={`Voir ${name}`}
                      className="relative block aspect-square w-full overflow-hidden rounded-lg bg-zinc-100"
                    >
                      <Image
                        fill
                        src={image}
                        alt={`Image de ${name} sur PRIMEPC Algérie.`}
                        className="object-cover"
                        sizes="(max-width: 639px) 50vw, 33vw"
                        unoptimized={image.startsWith("http")}
                      />
                    </Link>
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
            <Link
              href={`/products/${slug}`}
              aria-label={`Voir ${name}`}
              className="absolute inset-0"
            >
              <Image
                fill
                src={activeImage}
                alt={`Image de ${name} sur PRIMEPC Algérie.`}
                className="object-cover transition-transform duration-300 ease-out group-hover/image:scale-[1.02]"
                unoptimized={activeImage.startsWith("http")}
                sizes={
                  large
                    ? "(min-width: 1536px) 25vw, (min-width: 768px) 33vw, 50vw"
                    : "(min-width: 768px) 25vw, 50vw"
                }
              />
            </Link>

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

      <CardFooter className="flex h-full flex-col items-start px-2.5!">
        <Link
          href={`/products/${slug}`}
          className="focus-visible:ring-primary-300 mb-2 block w-full rounded-md transition outline-none focus-visible:ring-2"
        >
          <span className="text-accent-400 block text-xs uppercase">
            {brand}
          </span>
          <span className="mt-1 line-clamp-2 block text-sm font-medium underline-offset-2 hover:underline">
            {name}
          </span>
        </Link>

        {(badge || topSeller) && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {topSeller && (
              <Badge className="border-amber-300 bg-amber-100 text-amber-900">
                <Trophy />
                Top seller
              </Badge>
            )}
            {badge && (
              <Badge className="bg-green-500" variant="default">
                Nouveauté
              </Badge>
            )}
          </div>
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
          className={`mb-4 text-xs font-semibold uppercase ${
            inStock ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {inStock ? "EN STOCK" : "RUPTURE DE STOCK"}
        </p>

        <div className="mt-auto flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
          {hasVariants ? (
            <Button
              asChild
              size={large ? "default" : "sm"}
              className="h-auto min-h-8 min-w-0 flex-1 px-2 py-1.5 text-center text-xs leading-tight whitespace-normal sm:flex-none sm:px-3 sm:text-sm sm:whitespace-nowrap"
            >
              <Link href={`/products/${slug}`}>Choisir les options</Link>
            </Button>
          ) : (
            <AddToCartButton
              className="h-auto min-h-8 min-w-0 flex-1 px-2 py-1.5 text-center text-xs leading-tight whitespace-normal sm:flex-none sm:px-3 sm:text-sm sm:whitespace-nowrap"
              productId={productId}
              product={{
                name,
                coverImage: activeImage,
                finalPrice,
                slug,
                stock,
              }}
              large={large}
            />
          )}
          <FavoriteButton
            className="shrink-0"
            productId={productId}
            large={large}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
