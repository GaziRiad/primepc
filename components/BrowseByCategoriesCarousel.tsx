"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

type Category = {
  name: string;
  slug: string;
  image: string;
};

type BrowseByCategoriesCarouselProps = {
  categories: Category[];
};

export default function BrowseByCategoriesCarousel({
  categories,
}: BrowseByCategoriesCarouselProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const update = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    update();
    api.on("select", update);
    api.on("reInit", update);

    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  const centerCategories = categories.length <= 2;

  return (
    <div>
      <Carousel
        opts={{ align: "center", containScroll: "trimSnaps", dragFree: true }}
        className="relative"
        aria-label="Parcourir par catégorie"
        setApi={(nextApi) => setApi(nextApi)}
      >
        <CarouselContent
          className="cursor-grab active:cursor-grabbing"
          contentClassName={`items-stretch gap-2 px-2 sm:gap-8 sm:px-2 ${
            centerCategories ? "justify-center" : "justify-start"
          } sm:justify-center`}
        >
          {categories.map((category) => (
            <CarouselItem
              key={category.slug}
              className="basis-1/2 px-1 sm:basis-auto sm:px-2"
            >
              <Link
                href={`/products?categories=${encodeURIComponent(
                  category.slug,
                )}`}
                className="group flex w-full flex-col items-center gap-2 text-center"
              >
                <div className="relative flex aspect-square h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-zinc-200 sm:h-24 sm:w-24 lg:h-32 lg:w-32">
                  <Image
                    width={600}
                    height={600}
                    src={category.image || "/images/accessories.png"}
                    alt={`Categorie ${category.name} sur PRIMEPC.`}
                    className="h-24 w-24 rounded-full object-contain sm:h-16 sm:w-16 lg:h-20 lg:w-20"
                  />
                </div>

                <p className="group-hover:text-primary text-sm transition-all sm:text-base">
                  {category.name}
                </p>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-6 flex flex-col items-end gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => api?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Categorie precedente"
            className="h-11 w-11 rounded-full"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => api?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Categorie suivante"
            className="h-11 w-11 rounded-full"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
        {/* <p className="text-muted-foreground text-xs">Glissez pour voir plus</p> */}
      </div>
    </div>
  );
}
