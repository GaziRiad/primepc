import Image from "next/image";
import Link from "next/link";
import {
  MousePointerClick,
  ShoppingCart,
  Store,
  TrendingUp,
} from "lucide-react";

import { formatDZD } from "@/lib/utils";
import type { ProductAnalyticsSummary } from "@/lib/productAnalytics";

type ProductMetric = ProductAnalyticsSummary["topViewed"][number];

type MetricListProps = {
  emptyText: string;
  metric: keyof Pick<
    ProductMetric,
    "addToCarts" | "checkoutStarts" | "orderedRevenue" | "views"
  >;
  products: ProductMetric[];
  title: string;
  valueFormatter?: (product: ProductMetric) => string;
};

const FALLBACK_IMAGE = "/images/accessories.png";

function MetricList({
  emptyText,
  metric,
  products,
  title,
  valueFormatter,
}: MetricListProps) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-xs">
      <h3 className="text-foreground text-sm font-semibold">{title}</h3>

      {products.length === 0 || Number(products[0]?.[metric] ?? 0) === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">{emptyText}</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {products.map((product, index) => {
            const href = product.slug ? `/products/${product.slug}` : null;
            const content = (
              <>
                <span className="text-muted-foreground w-5 shrink-0 text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <Image
                    fill
                    src={product.coverImage || FALLBACK_IMAGE}
                    alt={product.name}
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground line-clamp-1 text-sm font-medium">
                    {product.name}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block text-xs">
                    {product.finalPrice > 0
                      ? formatDZD(product.finalPrice)
                      : "Aucun prix enregistré"}
                  </span>
                </span>
                <span className="text-foreground shrink-0 text-sm font-semibold">
                  {valueFormatter
                    ? valueFormatter(product)
                    : Number(product[metric] ?? 0)}
                </span>
              </>
            );

            return (
              <li key={`${title}-${product.productId}`}>
                {href ? (
                  <Link
                    href={href}
                    className="hover:bg-accent-50 flex items-center gap-3 rounded-xl p-2 transition"
                  >
                    {content}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl p-2">
                    {content}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default function AdminProductAnalytics({
  summary,
}: {
  summary: ProductAnalyticsSummary;
}) {
  return (
    <section className="rounded-2xl border bg-white p-4 shadow-xs sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Indicateurs de conversion
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Activité produit regroupée quotidiennement sur les {summary.days}{" "}
            derniers jours.
          </p>
        </div>
        <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Analyse des produits
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
          <MousePointerClick className="text-primary size-5" />
          <p className="text-muted-foreground mt-3 text-xs uppercase">
            Consultations des produits
          </p>
          <p className="text-foreground mt-1 text-xl font-semibold">
            {summary.totals.views}
          </p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
          <ShoppingCart className="size-5 text-indigo-600" />
          <p className="text-muted-foreground mt-3 text-xs uppercase">
            Ajouts au panier
          </p>
          <p className="text-foreground mt-1 text-xl font-semibold">
            {summary.totals.addToCarts}
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
          <Store className="size-5 text-amber-600" />
          <p className="text-muted-foreground mt-3 text-xs uppercase">
            Débuts de commande
          </p>
          <p className="text-foreground mt-1 text-xl font-semibold">
            {summary.totals.checkoutStarts}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
          <TrendingUp className="size-5 text-emerald-600" />
          <p className="text-muted-foreground mt-3 text-xs uppercase">
            Chiffre d’affaires commandé
          </p>
          <p className="text-foreground mt-1 text-xl font-semibold">
            {formatDZD(summary.totals.orderedRevenue)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <MetricList
          title="Produits les plus consultés"
          products={summary.topViewed}
          metric="views"
          emptyText="Aucune consultation de produit enregistrée."
        />
        <MetricList
          title="Produits les plus ajoutés au panier"
          products={summary.topAddedToCart}
          metric="addToCarts"
          emptyText="Aucun ajout au panier enregistré."
        />
        <MetricList
          title="Produits générant le plus de commandes"
          products={summary.topCheckoutStarted}
          metric="checkoutStarts"
          emptyText="Aucun début de commande enregistré."
        />
        <MetricList
          title="Produits les plus commandés"
          products={summary.topOrdered}
          metric="orderedRevenue"
          emptyText="Aucun produit commandé enregistré."
          valueFormatter={(product) => formatDZD(product.orderedRevenue)}
        />
      </div>
    </section>
  );
}
