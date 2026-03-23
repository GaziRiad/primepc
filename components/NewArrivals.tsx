import { getAllProducts } from "@/lib/services";
import ProductCard from "./ProductCard";
import { auth } from "@/lib/auth";

export default async function NewArrivals() {
  // get user
  const session = await auth();

  const products = await getAllProducts(undefined, session?.user.id);

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
