import Link from "next/link";
import ProductCard from "./ProductCard";

import { type Product } from "@/lib/types";

const Products: Product[] = [
  {
    title: "MacBook Air (M5, 2026)",
    brand: "Apple",
    price: 86000,
    href: "/product1",
    discount: 20,
    image: "/images/sutdy.png",
    category: "Student",
  },
  {
    title: "MacBook Air (M5, 2026)",
    brand: "Apple",
    price: 120000,
    href: "/product2",
    discount: 35,
    image: "/images/sutdy.png",
    category: "Student",
  },
  {
    title: "MacBook Air (M5, 2026)",
    brand: "Apple",
    price: 62000,
    href: "/product3",
    discount: 10,
    image: "/images/sutdy.png",
    category: "Student",
  },
  {
    title: "MacBook Air (M5, 2026)",
    brand: "Apple",
    price: 225000,
    href: "/product4",
    discount: 25,
    image: "/images/sutdy.png",
    category: "Student",
  },
  //
  {
    title: "MacBook Air (M5, 2026)",
    brand: "Apple",
    price: 86000,
    href: "/product5",
    discount: 20,
    image: "/images/sutdy.png",
    category: "Student",
  },
  {
    title: "MacBook Air (M5, 2026)",
    brand: "Apple",
    price: 120000,
    href: "/product6",
    discount: 35,
    image: "/images/sutdy.png",
    category: "Student",
  },
  {
    title: "MacBook Air (M5, 2026)",
    brand: "Apple",
    price: 62000,
    href: "/product7",
    discount: 10,
    image: "/images/sutdy.png",
    category: "Student",
  },
  {
    title: "MacBook Air (M5, 2026)",
    brand: "Apple",
    price: 225000,
    href: "/product8",
    discount: 25,
    image: "/images/sutdy.png",
    category: "Student",
  },
];

export default function NewArrivals() {
  return (
    <section className="py-20">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-foreground text-2xl font-semibold">New Arrivals</h2>

        <div className="hover:bg-primary cursor-pointer rounded-full bg-zinc-100 px-4 py-2 text-sm text-black transition-all hover:text-white">
          view all
        </div>
      </div>

      <ul className="grid grid-cols-4 gap-6">
        {Products.map((product, index) => (
          <li key={index}>
            <Link href={product.href}>
              <ProductCard product={product} newArrival={true} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
