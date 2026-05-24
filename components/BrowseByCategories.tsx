import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/services";

import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

type Category = {
  name: string;
  slug: string;
  image: string;
};

export default async function BrowseByCategories() {
  const categories = (await getAllCategories()) as Category[];
  const centerCategories = categories.length <= 2;

  return (
    <section className="py-16 sm:py-20">
      <h2 className="text-foreground mb-8 text-center text-xl font-semibold sm:text-2xl">
        Browse by Category
      </h2>
      {categories.length === 0 ? (
        <p className="text-accent-400 text-center text-sm">
          No categories available right now.
        </p>
      ) : (
        <Carousel
          opts={{ align: "center", containScroll: "trimSnaps", dragFree: true }}
          className="relative"
          aria-label="Browse by category"
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
                      alt={`Category ${category.name} on PRIMEPC algeria.`}
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
      )}
    </section>
  );
}
