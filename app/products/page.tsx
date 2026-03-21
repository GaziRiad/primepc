import Filters from "@/components/(user)/Filters";
import SorterFilter from "@/components/(user)/SorterFilter";
import ProductCard from "@/components/ProductCard";
import { getAllCategories, getAllProducts } from "@/lib/services";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  // console.log(query);
  const products = await getAllProducts(query);
  const categories = await getAllCategories();

  return (
    <div className="">
      <div className="mx-auto max-w-7xl py-8">
        <h2 className="text-accent text-2xl font-semibold">
          Explore All products
        </h2>
      </div>

      <section className="bg-accent-50 py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-[27fr_73fr] gap-8">
          <Filters categories={categories} />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl border-[0.5px] bg-white px-5 py-3 shadow-xs">
              <SorterFilter />
              <p className="text-sm">Showing 6 of 10 Products</p>
            </div>

            <div className="rounded-xl border-[0.5px] bg-white px-5 py-6 shadow-xs">
              <ul className="grid grid-cols-4 gap-6">
                {products?.slice(0, 8).map((product, index) => (
                  <li key={index}>
                    <ProductCard product={product} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
