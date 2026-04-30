import Filters from "@/components/(user)/Filters";
import SorterFilter from "@/components/(user)/SorterFilter";
import PaginationTable from "@/components/PaginationTable";
import ProductCard from "@/components/ProductCard";

import { getAllCategories, getProductsPage } from "@/lib/services";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const categories = await getAllCategories();
  const {
    items: products,
    total,
    page,
    limit,
    totalPages,
  } = await getProductsPage(query);
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

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

          <div className="flex flex-col">
            <div className="flex items-center justify-between rounded-xl border-[0.5px] bg-white px-5 py-3 shadow-xs">
              <SorterFilter />
              <p className="text-sm">
                Showing {start}-{end} of {total} Products
              </p>
            </div>

            {/* <div className="flex min-h-194 flex-col rounded-xl border-[0.5px] px-5 py-6 shadow-xs"> */}
            <div className="flex flex-col py-3 shadow-xs">
              {products.length === 0 ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-muted-foreground">No products found.</p>
                </div>
              ) : (
                <ul className="grid flex-1 grid-cols-4 content-start gap-6">
                  {products.map((product, index) => (
                    <li key={index}>
                      <ProductCard product={product} />
                    </li>
                  ))}
                </ul>
              )}

              {totalPages > 1 && (
                <PaginationTable
                  page={page}
                  totalPages={totalPages}
                  query={query}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
