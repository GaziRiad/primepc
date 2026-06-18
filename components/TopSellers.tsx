import Link from "next/link";

import ProductCard from "@/components/ProductCard";
import { getAllProducts } from "@/lib/services";

export default async function TopSellers() {
  const products = await getAllProducts({ limit: "4", topSeller: "true" });

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-2xl font-semibold capitalize">
            Top sellers
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Les produits PRIMEPC les plus demandes du moment.
          </p>
        </div>

        <Link
          href="/products?topSeller=true"
          className="hover:bg-primary w-fit cursor-pointer rounded-full border bg-zinc-100 px-4 py-2 text-sm text-black transition-all hover:text-white"
        >
          voir tous
        </Link>
      </div>

      {products.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4">
          {products.slice(0, 4).map((product, index) => (
            <li key={String(product._id ?? product.slug ?? index)}>
              <ProductCard product={product} large={true} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed bg-white px-6 py-10 text-center shadow-xs">
          <p className="text-foreground font-medium">
            Aucun top seller n&apos;est encore marque.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Marquez des produits comme Top seller dans l&apos;admin pour les
            afficher ici.
          </p>
        </div>
      )}
    </section>
  );
}
