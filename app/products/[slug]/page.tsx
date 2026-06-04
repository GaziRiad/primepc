import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CircleX,
  PackageCheck,
  ShieldCheck,
  Star,
  Truck,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Separator } from "@/components/ui/separator";
import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/(user)/FavoriteButton";
import ProductGallery from "@/components/ProductGallery";
import { formatDZD } from "@/lib/utils";
import { getProduct } from "@/lib/services";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

type ProductCategory = {
  name?: string;
  slug?: string;
};

const PERKS = [
  { icon: Truck, label: "Free delivery on orders 40,000DA+" },
  { icon: Wallet, label: "Payment on delivery available" },
  { icon: ShieldCheck, label: "6 months warranty from PRIMEPC" },
];

export default async function page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const productId = String(product._id);
  const stockCount = Number(product.stock ?? 0);
  const inStock = stockCount > 0;
  const displayBrand = product.brand || "PRIMEPC";
  const savings = Math.max(
    0,
    Number(product.price ?? 0) - Number(product.finalPrice ?? 0),
  );
  const isLowStock = inStock && stockCount <= 3;
  const availabilityLabel = inStock
    ? isLowStock
      ? "Almost sold out"
      : "Limited stock available"
    : "Currently unavailable";
  const stockLabel = inStock
    ? isLowStock
      ? "Low stock - order soon"
      : "Available for delivery"
    : "Out of stock";
  const additionalStockLabel = inStock
    ? isLowStock
      ? "Low stock"
      : "Available"
    : "Out of stock";
  const productSummary =
    product.description ||
    "Built for performance, crafted for reliability, and ready for your next upgrade.";

  const rawImages = [product.coverImage, ...(product.images ?? [])].filter(
    (image): image is string =>
      typeof image === "string" && image.trim() !== "",
  );
  const gallery = rawImages;

  const categories = Array.isArray(product.categories)
    ? (product.categories as ProductCategory[])
    : [];
  const categoryNames = categories
    .map((category) => category?.name)
    .filter((name): name is string => Boolean(name));

  const specs: Array<[string, string]> = (() => {
    if (!product.specs) return [];
    if (product.specs instanceof Map) {
      const entries = Array.from(
        product.specs.entries() as Iterable<[unknown, unknown]>,
      );

      return entries.map((entry) => {
        const [key, value] = entry;
        return [String(key), String(value)];
      });
    }

    if (typeof product.specs === "object") {
      return Object.entries(product.specs as Record<string, string>).map(
        ([key, value]) => [key, String(value)],
      );
    }

    return [];
  })();

  return (
    <div className="bg-accent-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: product.name },
          ]}
        />

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <ProductGallery images={gallery} productName={product.name} />

          <aside className="overflow-hidden rounded-2xl border bg-white shadow-xs">
            <div className="border-b px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-primary-700 text-xs font-semibold tracking-[0.18em] uppercase">
                    {displayBrand}
                  </p>
                  <h1 className="text-foreground mt-2 text-3xl leading-tight font-semibold sm:text-4xl">
                    {product.name}
                  </h1>
                </div>
                <Badge
                  variant={inStock ? "secondary" : "destructive"}
                  className={
                    inStock
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }
                >
                  {inStock ? "In stock" : "Out of stock"}
                </Badge>
              </div>

              <div className="text-accent-400 mt-4 flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={`star-${index}`}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span>0 reviews</span>
                <span className="text-accent-300">-</span>
                <span
                  className={inStock ? "text-emerald-600" : "text-rose-600"}
                >
                  {availabilityLabel}
                </span>
              </div>
            </div>

            <div className="px-5 py-5 sm:px-7 sm:py-6">
              <div className="bg-primary-50/70 rounded-2xl px-4 py-4">
                <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                  <span className="text-primary-800 text-3xl font-semibold sm:text-4xl">
                    {formatDZD(product.finalPrice)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-accent-300 pb-1 text-sm line-through">
                      {formatDZD(product.price)}
                    </span>
                  )}
                  {product.discount > 0 && (
                    <Badge className="text-primary-700 bg-white">
                      {product.discount}% off
                    </Badge>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-primary-700 mt-2 text-sm font-medium">
                    You save {formatDZD(savings)} on this product.
                  </p>
                )}
              </div>

              <div className="mt-5">
                <p className="text-accent-500 line-clamp-3 text-sm leading-6">
                  {productSummary}
                </p>
                <Link
                  href="#description"
                  className="text-primary mt-2 inline-flex text-sm font-semibold hover:underline"
                >
                  Full product details below
                </Link>
              </div>

              <div className="mt-6 border-y py-5">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex size-10 items-center justify-center rounded-full ${
                      inStock
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {inStock ? (
                      <PackageCheck className="size-5" />
                    ) : (
                      <CircleX className="size-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-semibold">
                      {stockLabel}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Orders are confirmed by our team before delivery.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                  <AddToCartButton
                    productId={productId}
                    product={{
                      name: product.name,
                      coverImage: product.coverImage,
                      finalPrice: product.finalPrice,
                      stock: product.stock,
                    }}
                    className="h-12 w-full text-base font-semibold"
                    large
                  />
                  <FavoriteButton
                    productId={productId}
                    className="size-12 border bg-white text-rose-600 hover:bg-rose-50"
                    large
                  />
                </div>
              </div>

              <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                {PERKS.map((perk) => (
                  <li
                    key={perk.label}
                    className="text-accent-500 flex items-start gap-2 text-sm"
                  >
                    <perk.icon className="text-primary mt-0.5 size-4 shrink-0" />
                    <span>{perk.label}</span>
                  </li>
                ))}
              </ul>

              {categories.length > 0 && (
                <div className="mt-6">
                  <p className="text-accent-400 mb-2 text-xs font-semibold tracking-wide uppercase">
                    Categories
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {categories
                      .filter((category) => Boolean(category?.slug))
                      .map((category, index) => (
                        <Badge
                          key={`${category.slug ?? "category"}-${index}`}
                          variant="outline"
                          asChild
                          className="bg-white"
                        >
                          <Link
                            href={`/products?categories=${encodeURIComponent(
                              category.slug ?? "",
                            )}`}
                          >
                            {category.name ?? "Category"}
                          </Link>
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-14 rounded-2xl border bg-white shadow-xs">
          <div className="flex flex-wrap gap-2 border-b px-4 py-3 text-sm sm:px-6 sm:text-base">
            <Link
              href="#description"
              className="bg-primary/10 text-primary rounded-full px-4 py-2 font-semibold transition"
            >
              Description
            </Link>
            <Link
              href="#additional"
              className="text-accent-400 hover:text-primary rounded-full px-4 py-2 font-semibold transition"
            >
              Additional Information
            </Link>
            <Link
              href="#reviews"
              className="text-accent-400 hover:text-primary rounded-full px-4 py-2 font-semibold transition"
            >
              Reviews
            </Link>
          </div>

          <div className="space-y-10 px-5 py-6 sm:px-8 sm:py-8">
            <section id="description" className="scroll-mt-24">
              <h2 className="text-foreground text-xl font-semibold">
                Description
              </h2>
              <p className="text-accent-500 mt-4 max-w-4xl text-base leading-7">
                {productSummary}
              </p>
            </section>

            <Separator />

            <section id="additional" className="scroll-mt-24">
              <h2 className="text-foreground text-xl font-semibold">
                Additional Information
              </h2>
              <dl className="mt-5 grid gap-4 text-base">
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-accent-400">Brand</dt>
                  <dd className="text-foreground font-medium">
                    {displayBrand}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-accent-400">Stock</dt>
                  <dd className="text-foreground font-medium">
                    {additionalStockLabel}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-accent-400">Categories</dt>
                  <dd className="text-foreground font-medium sm:text-right">
                    {categoryNames.length > 0
                      ? categoryNames.join(", ")
                      : "Uncategorized"}
                  </dd>
                </div>
              </dl>

              {specs.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-accent-400 text-sm font-semibold tracking-wide uppercase">
                    Specifications
                  </h3>
                  <dl className="mt-4 grid gap-4 text-base">
                    {specs.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <dt className="text-accent-400 capitalize">
                          {label.replace(/_/g, " ")}
                        </dt>
                        <dd className="text-foreground font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </section>

            <Separator />

            <section id="reviews" className="scroll-mt-24">
              <h2 className="text-foreground text-xl font-semibold">Reviews</h2>
              <p className="text-accent-500 mt-4 text-base leading-7">
                No reviews yet. Be the first to share your experience.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
