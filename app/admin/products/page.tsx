import { Suspense } from "react";

import startDbConnection from "@/lib/db";
import Product from "@/models/Product";
import ProductsToolbar from "@/components/admin/ProductsToolbar";
import ProductsTable from "@/components/admin/ProductsTable";
import PaginationTable from "@/components/PaginationTable";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const search = typeof query.q === "string" ? query.q.trim() : "";
  const stockFilter = typeof query.stock === "string" ? query.stock : "";

  await startDbConnection();

  const filter: Record<string, unknown> = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [{ name: regex }, { brand: regex }, { slug: regex }];
  }

  if (stockFilter === "in") {
    filter.stock = { $gt: 0 };
  }

  if (stockFilter === "out") {
    filter.stock = { $lte: 0 };
  }

  const total = await Product.countDocuments(filter);
  const limit = 10;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const page = Math.max(1, Math.min(Number(query.page) || 1, totalPages || 1));
  const skip = (page - 1) * limit;

  const products = await Product.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      "name brand price finalPrice discount stock coverImage slug updatedAt",
    )
    .lean();

  const safeProducts = JSON.parse(JSON.stringify(products));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Products catalog
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Showing {start}-{end} of {total} products.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-16 rounded-2xl border bg-white shadow-xs" />
        }
      >
        <ProductsToolbar
          key={`${search}-${stockFilter || "all"}`}
          initialQuery={search}
          initialStock={stockFilter || "all"}
        />
      </Suspense>

      <ProductsTable products={safeProducts} />

      {totalPages > 1 && (
        <PaginationTable
          page={page}
          totalPages={totalPages}
          query={query}
          basePath="/admin/products"
        />
      )}
    </div>
  );
}
