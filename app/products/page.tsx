import Filters from "@/components/(user)/Filters";
import NewArrivals from "@/components/NewArrivals";
import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/services";

export default async function page() {
  const products = await getAllProducts();

  return (
    <div className="">
      <div className="mx-auto max-w-7xl py-8">
        <h2 className="text-accent text-2xl font-semibold">
          Explore All products
        </h2>
      </div>

      <section className="bg-accent-50 py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-[27fr_73fr] gap-8">
          <Filters />
          <div className="rounded-xl border-[0.5px] bg-white px-5 py-6 shadow-xs">
            <ul className="grid grid-cols-4 gap-6">
              {products.slice(0, 8).map((product, index) => (
                <li key={index}>
                  <ProductCard product={product} newArrival={true} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
