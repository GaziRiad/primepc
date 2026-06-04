import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
  const inStock = Number(product.stock ?? 0) > 0;
  const displayBrand = product.brand || "PRIMEPC";

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
        <div className="text-accent-400 mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="hover:text-primary transition">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition">
            Products
          </Link>
          <span>/</span>
          <span className="text-accent-600">{product.name}</span>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <ProductGallery images={gallery} productName={product.name} />

          <div className="rounded-2xl border bg-white p-6 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-accent-400 text-xs uppercase">
                {displayBrand}
              </p>
              {product.discount > 0 && (
                <Badge variant="secondary">-{product.discount}%</Badge>
              )}
              <Badge
                variant={inStock ? "secondary" : "destructive"}
                className={inStock ? "bg-emerald-100 text-emerald-700" : ""}
              >
                {inStock ? "In Stock" : "Out of Stock"}
              </Badge>
            </div>

            <h1 className="text-foreground mt-3 text-2xl font-semibold sm:text-3xl">
              {product.name}
            </h1>

            <div className="text-accent-400 mt-2 flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={`star-${index}`}
                    className="size-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span>0 reviews</span>
              <span className="text-accent-300">•</span>
              <span className={inStock ? "text-emerald-600" : "text-rose-600"}>
                {inStock ? "Ready to ship" : "Currently unavailable"}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-3">
              <span className="text-primary-700 text-3xl font-semibold">
                {formatDZD(product.finalPrice)}
              </span>
              {product.discount > 0 && (
                <span className="text-accent-300 text-sm line-through">
                  {formatDZD(product.price)}
                </span>
              )}
              {product.discount > 0 && (
                <Badge variant="secondary">{product.discount}% OFF</Badge>
              )}
            </div>

            {/* <p
              className={`mt-2 text-xs font-semibold ${
                inStock ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {inStock && product.stock <= 3
                ? `Only ${product.stock} left in stock`
                : product.stock > 3
                  ? "IN STOCK"
                  : "OUT OF STOCK"}
            </p> */}

            <Separator className="my-6" />

            <p className="text-accent-500 text-sm leading-6">
              {product.description ||
                "Built for performance, crafted for reliability, and ready for your next upgrade."}
            </p>

            <ul className="text-accent-500 mt-5 space-y-2 text-sm">
              {PERKS.map((perk) => (
                <li key={perk.label} className="flex items-center gap-2">
                  <perk.icon className="text-primary size-4" />
                  <span>{perk.label}</span>
                </li>
              ))}
            </ul>

            <Separator className="my-6" />

            <div className="flex flex-wrap items-center gap-3">
              <AddToCartButton
                productId={productId}
                product={{
                  name: product.name,
                  coverImage: product.coverImage,
                  finalPrice: product.finalPrice,
                  stock: product.stock,
                }}
                large
              />
              <FavoriteButton productId={productId} large />
            </div>

            {categories.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {categories
                  .filter((category) => Boolean(category?.slug))
                  .map((category, index) => (
                    <Badge
                      key={`${category.slug ?? "category"}-${index}`}
                      variant="outline"
                      asChild
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
            )}
          </div>
        </div>

        <div className="mt-12 rounded-2xl border bg-white shadow-xs">
          <div className="flex flex-wrap gap-2 border-b px-4 py-3 text-sm">
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

          <div className="space-y-8 px-6 py-6">
            <section id="description" className="scroll-mt-24">
              <h2 className="text-foreground text-base font-semibold">
                Description
              </h2>
              <p className="text-accent-500 mt-3 text-sm leading-6">
                {product.description ||
                  "This product is part of our curated selection of performance hardware and accessories."}
              </p>
            </section>

            <Separator />

            <section id="additional" className="scroll-mt-24">
              <h2 className="text-foreground text-base font-semibold">
                Additional Information
              </h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-accent-400">Brand</dt>
                  <dd className="text-foreground font-medium">
                    {displayBrand}
                  </dd>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-accent-400">Stock</dt>
                  <dd className="text-foreground font-medium">
                    {inStock ? `${product.stock} available` : "Out of stock"}
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
                <div className="mt-6">
                  <h3 className="text-accent-400 text-xs uppercase">
                    Specifications
                  </h3>
                  <dl className="mt-3 grid gap-3 text-sm">
                    {specs.map(([label, value]) => (
                      <div
                        key={label}
                        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
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
              <h2 className="text-foreground text-base font-semibold">
                Reviews
              </h2>
              <p className="text-accent-500 mt-3 text-sm">
                No reviews yet. Be the first to share your experience.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
