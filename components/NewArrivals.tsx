import { getAllProducts } from "@/lib/services";
import ProductCard from "./ProductCard";

export default async function NewArrivals() {
  const products = await getAllProducts();

  return (
    <section className="py-20">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-foreground text-2xl font-semibold">New Arrivals</h2>

        <div className="hover:bg-primary cursor-pointer rounded-full border bg-zinc-100 px-4 py-2 text-sm text-black transition-all hover:text-white">
          view all
        </div>
      </div>

      <ul className="grid grid-cols-4 gap-6">
        {products.slice(0, 8).map((product, index) => (
          <li key={index}>
            <ProductCard product={product} large={true} />
          </li>
        ))}
      </ul>
    </section>
  );
}
