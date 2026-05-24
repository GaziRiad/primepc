import Filters from "@/components/(user)/Filters";
import FiltersDrawer from "@/components/(user)/FiltersDrawer";
import SorterFilter from "@/components/(user)/SorterFilter";
import PaginationTable from "@/components/PaginationTable";
import ProductCard from "@/components/ProductCard";

import { Suspense } from "react";

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-accent text-xl font-semibold sm:text-2xl">
          Explore All products
        </h2>
      </div>

      <section className="bg-accent-50 py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[27fr_73fr] lg:px-8">
          <div className="hidden lg:block">
            <Suspense
              fallback={
                <div className="rounded-xl border-[0.5px] bg-white px-5 py-3 shadow-xs" />
              }
            >
              <Filters categories={categories} />
            </Suspense>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col gap-3 rounded-xl border-[0.5px] bg-white px-5 py-3 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="lg:hidden">
                  <FiltersDrawer categories={categories} />
                </div>
                <Suspense
                  fallback={
                    <div
                      className="h-9 w-full rounded-lg bg-white sm:max-w-48"
                      aria-hidden
                    />
                  }
                >
                  <SorterFilter />
                </Suspense>
              </div>
              <p className="text-xs sm:text-sm">
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
                <ul className="grid flex-1 grid-cols-1 content-start gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 xl:grid-cols-3">
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
