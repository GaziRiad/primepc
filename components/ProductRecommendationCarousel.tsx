"use client";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { RecommendedProduct } from "@/lib/productRecommendations";
import { formatDZD } from "@/lib/utils";

type ProductRecommendationCarouselProps = {
  description: string;
  products: RecommendedProduct[];
  title: string;
};

const FALLBACK_IMAGE = "/images/accessories.png";

export default function ProductRecommendationCarousel({
  description,
  products,
  title,
}: ProductRecommendationCarouselProps) {
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const updateControls = () => {
      setCanScrollPrevious(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateControls();
    api.on("select", updateControls);
    api.on("reInit", updateControls);

    return () => {
      api.off("select", updateControls);
      api.off("reInit", updateControls);
    };
  }, [api]);

  if (products.length === 0) return null;

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-foreground text-xl font-semibold sm:text-2xl">
              {title}
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
              {description}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label={`Précédent : ${title}`}
              disabled={!canScrollPrevious}
              onClick={() => api?.scrollPrev()}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label={`Suivant : ${title}`}
              disabled={!canScrollNext}
              onClick={() => api?.scrollNext()}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>

        <Carousel
          opts={{ align: "start", loop: products.length > 4 }}
          setApi={setApi}
        >
          <CarouselContent contentClassName="-ml-3">
            {products.map((product) => (
              <CarouselItem
                key={product._id}
                className="basis-[94%] pl-3 sm:basis-2/3 md:basis-1/2 lg:basis-2/5 xl:basis-1/3"
              >
                <Link
                  href={`/products/${product.slug}`}
                  className="group hover:border-primary/40 focus-visible:ring-primary grid h-full min-h-40 grid-cols-[9rem_minmax(0,1fr)] overflow-hidden rounded-lg border bg-white shadow-xs transition-[border-color,box-shadow] hover:shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <div className="bg-muted relative min-h-40 overflow-hidden">
                    <Image
                      src={product.image || FALLBACK_IMAGE}
                      alt={product.name}
                      fill
                      sizes="144px"
                      className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
                      unoptimized={product.image.startsWith("http")}
                    />
                    {product.topSeller && (
                      <Badge className="absolute top-3 left-3 border-amber-300 bg-amber-100 text-amber-900 shadow-sm">
                        <Trophy />
                        Top seller
                      </Badge>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col p-4">
                    <p className="text-muted-foreground truncate text-[11px] font-medium uppercase">
                      {product.brand || "PRIMEPC"}
                    </p>
                    <h3 className="text-foreground mt-1 line-clamp-2 text-base font-semibold">
                      {product.name}
                    </h3>

                    <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-foreground text-base font-semibold">
                        {formatDZD(product.finalPrice || product.price)}
                      </span>
                      {product.discount > 0 &&
                        product.price > product.finalPrice && (
                          <span className="text-muted-foreground text-xs line-through">
                            {formatDZD(product.price)}
                          </span>
                        )}
                    </div>

                    <span className="text-primary mt-auto flex items-center gap-1 pt-3 text-sm font-semibold">
                      Voir le produit
                      <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
