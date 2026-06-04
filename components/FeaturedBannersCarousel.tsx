"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { MarketingBanner } from "@/types/marketing";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "./ui/carousel";

const AUTO_ADVANCE_MS = 6500;

type FeaturedBannersCarouselProps = {
  heroSlides: MarketingBanner[];
  sideBanners: MarketingBanner[];
};

function BannerImage({
  banner,
  priority = false,
  sizes,
}: {
  banner: MarketingBanner;
  priority?: boolean;
  sizes: string;
}) {
  const image = (
    <Image
      fill
      src={banner.image}
      alt={banner.alt}
      className="object-cover"
      priority={priority}
      sizes={sizes}
    />
  );

  if (!banner.href) return image;

  return (
    <Link
      href={banner.href}
      aria-label={banner.alt}
      className="block h-full w-full"
    >
      {image}
    </Link>
  );
}

export default function FeaturedBannersCarousel({
  heroSlides,
  sideBanners,
}: FeaturedBannersCarouselProps) {
  const visibleSlides = heroSlides.filter(
    (banner) => banner.isActive && banner.image,
  );
  const visibleSideBanners = sideBanners
    .filter((banner) => banner.isActive && banner.image)
    .slice(0, 2);

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateActive = () => {
      setActiveIndex(api.selectedScrollSnap());
    };

    updateActive();
    api.on("select", updateActive);
    api.on("reInit", updateActive);

    return () => {
      api.off("select", updateActive);
      api.off("reInit", updateActive);
    };
  }, [api]);

  useEffect(() => {
    if (!api || isPaused || visibleSlides.length <= 1) {
      return undefined;
    }

    const timer = setInterval(() => {
      api.scrollNext();
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [api, isPaused, visibleSlides.length]);

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 sm:mb-12 sm:gap-5 lg:grid-cols-[70fr_30fr] lg:gap-x-5">
      <Carousel
        opts={{ loop: visibleSlides.length > 1 }}
        setApi={setApi}
        className="relative h-80 w-full touch-pan-y overflow-hidden rounded-lg lg:h-96 xl:h-120"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        aria-label="Featured product highlights"
      >
        <CarouselContent className="h-full">
          {visibleSlides.map((slide, index) => (
            <CarouselItem
              key={`${slide.image}-${index}`}
              className="relative h-full"
            >
              <BannerImage
                banner={slide}
                priority={index === 0}
                sizes="(min-width: 1280px) 980px, (min-width: 1024px) 70vw, 100vw"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        {visibleSlides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {visibleSlides.map((slide, index) => (
              <button
                key={`${slide.image}-dot-${index}`}
                type="button"
                onClick={() => api?.scrollTo(index)}
                aria-label={`Show slide ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-8 bg-white"
                    : "w-4 bg-white/60 hover:bg-white/90"
                }`}
              />
            ))}
          </div>
        )}
      </Carousel>

      {visibleSideBanners.length > 0 && (
        <div className="hidden gap-4 sm:grid-cols-2 sm:gap-5 lg:grid lg:h-72 lg:grid-cols-1 lg:grid-rows-[1fr_1fr] xl:h-120">
          {visibleSideBanners.map((banner, index) => (
            <div
              key={`${banner.image}-side-${index}`}
              className="relative h-32 w-full overflow-hidden rounded-lg sm:h-40 lg:h-full"
            >
              <BannerImage
                banner={banner}
                sizes="(min-width: 1280px) 420px, (min-width: 1024px) 30vw, 50vw"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
