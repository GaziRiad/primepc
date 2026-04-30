import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/services";

type Category = {
  name: string;
  slug: string;
  image: string;
};

export default async function BrowseByCategories() {
  const categories = (await getAllCategories()) as Category[];

  return (
    <section className="py-20">
      <h2 className="text-foreground mb-8 text-center text-2xl font-semibold">
        Browse by Category
      </h2>
      {categories.length === 0 ? (
        <p className="text-accent-400 text-center text-sm">
          No categories available right now.
        </p>
      ) : (
        <ul className="flex items-center justify-center gap-24">
          {categories.map((category) => (
            <li key={category.slug} className="group">
              <Link
                href={`/products?categories=${encodeURIComponent(
                  category.slug,
                )}`}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative flex aspect-square h-32 max-w-32 items-center justify-center overflow-hidden rounded-full bg-zinc-200">
                  <Image
                    width={600}
                    height={600}
                    src={category.image || "/images/accessories.png"}
                    alt={`Category ${category.name} on PRIMEPC algeria.`}
                    className="h-20 max-w-20 rounded-full object-contain"
                  />
                </div>

                <p className="group-hover:text-primary transition-all">
                  {category.name}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
