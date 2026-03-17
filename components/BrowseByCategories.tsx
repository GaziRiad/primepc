import Image from "next/image";
import Link from "next/link";

const Categories = [
  {
    name: "Laptops for studying",
    image: "/images/sutdy.png",
  },
  {
    name: "Gaming",
    image: "/images/gaming.png",
  },
  {
    name: "Design & creativity",
    image: "/images/sutdy.png",
  },
  {
    name: "Accessories",
    image: "/images/accessories.png",
  },
] as const;

export default function BrowseByCategories() {
  return (
    <section className="py-20">
      <h2 className="text-primary mb-8 text-center text-2xl font-semibold">
        Browse by Category
      </h2>
      <ul className="flex items-center justify-center gap-24">
        {Categories.map((category, index) => (
          <li key={index} className="group">
            <Link
              href="/categories"
              className="flex flex-col items-center gap-4"
            >
              <div className="relative flex aspect-square h-32 max-w-32 items-center justify-center overflow-hidden rounded-full bg-zinc-200">
                <Image
                  width={600}
                  height={600}
                  src={category.image}
                  alt="Category of studies on PRIMEPC algeria."
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
    </section>
  );
}
