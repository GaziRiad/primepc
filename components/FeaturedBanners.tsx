"use client";

import img1 from "@/public/images/marketing1.jpg";
import img2 from "@/public/images/marketing2.jpg";
import img3 from "@/public/images/marketing3.jpg";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "./ui/carousel";

const SLIDES = [
  {
    id: "marketing-1",
    image: img1,
    imageAlt: "banner image from PRIMEPC algeria.",
  },
  {
    id: "marketing-2",
    image: img2,
    imageAlt: "banner image from PRIMEPC algeria.",
  },
  {
    id: "marketing-3",
    image: img3,
    imageAlt: "banner image from PRIMEPC algeria.",
  },
];

const AUTO_ADVANCE_MS = 6500;

export default function FeaturedBanners() {
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
    if (!api || isPaused) {
      return undefined;
    }

    const timer = setInterval(() => {
      api.scrollNext();
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [api, isPaused]);

  return (
    <section className="mb-8 grid grid-cols-1 gap-4 sm:mb-12 sm:gap-5 lg:grid-cols-[70fr_30fr] lg:gap-x-5">
      <Carousel
        opts={{ loop: true }}
        setApi={setApi}
        className="relative h-80 w-full touch-pan-y overflow-hidden rounded-lg lg:h-96 xl:h-120"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        aria-label="Featured product highlights"
      >
        <CarouselContent className="h-full">
          {SLIDES.map((slide, index) => (
            <CarouselItem key={slide.id} className="relative h-full">
              <Image
                fill
                src={slide.image}
                alt={slide.imageAlt}
                className="object-cover"
                priority={index === 0}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
          {SLIDES.map((slide, index) => (
            <button
              key={`${slide.id}-dot`}
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
      </Carousel>

      <div className="hidden gap-4 sm:grid-cols-2 sm:gap-5 lg:grid lg:h-72 lg:grid-cols-1 lg:grid-rows-[1fr_1fr] xl:h-120">
        <div className="relative h-32 w-full overflow-hidden rounded-lg sm:h-40 lg:h-full">
          <Image
            fill
            src={img2}
            alt="banner image from PRIMEPC algeria."
            className="object-cover"
          />
        </div>
        <div className="relative h-32 w-full overflow-hidden rounded-lg sm:h-40 lg:h-full">
          <Image
            fill
            src={img3}
            alt="banner image from PRIMEPC algeria."
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
