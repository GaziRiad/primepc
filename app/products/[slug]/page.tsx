import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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
import ProductPurchasePanel from "@/components/ProductPurchasePanel";
import ProductRecommendationCarousel from "@/components/ProductRecommendationCarousel";
import ProductGallery from "@/components/ProductGallery";
import { ProductVariationImageProvider } from "@/components/ProductVariationImageContext";
import ProductInfoTabs from "@/components/ProductInfoTabs";
import ProductViewTracker from "@/components/ProductViewTracker";
import { formatDZD } from "@/lib/utils";
import { getProduct } from "@/lib/services";
import {
  productDescriptionToPlainText,
  sanitizeProductDescription,
} from "@/lib/productDescription";
import type { ProductVariant } from "@/lib/productVariants";
import { getProductRecommendations } from "@/lib/productRecommendations";

export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) return {};

  const description =
    productDescriptionToPlainText(product.description).slice(0, 160) ||
    `Découvrez ${product.name} chez PRIMEPC avec livraison partout en Algérie.`;
  const canonical = `/products/${product.slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${product.name} | PRIMEPC`,
      description,
      images: product.coverImage
        ? [{ url: product.coverImage, alt: product.name }]
        : undefined,
    },
  };
}

type ProductCategory = {
  name?: string;
  slug?: string;
};

const PERKS = [
  { icon: Truck, label: "Livraison offerte dès 40 000 DA" },
  { icon: Wallet, label: "Paiement à la livraison disponible" },
  { icon: ShieldCheck, label: "Garantie PRIMEPC de 3 mois" },
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
  const recommendations = await getProductRecommendations(productId);
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
      ? "Presque épuisé"
      : "Stock limité disponible"
    : "Actuellement indisponible";
  const stockLabel = inStock
    ? isLowStock
      ? "Stock faible - commandez rapidement"
      : "Disponible pour livraison"
    : "Rupture de stock";
  const additionalStockLabel = inStock
    ? isLowStock
      ? "Stock faible"
      : "Disponible"
    : "Rupture de stock";
  const fallbackDescription =
    "Pensé pour la performance, conçu pour durer et prêt pour votre prochaine évolution.";
  const descriptionHtml = sanitizeProductDescription(
    product.description || fallbackDescription,
  );

  const variantImages = Array.isArray(product.variants)
    ? product.variants
        .filter((variant: { active?: boolean }) => variant.active !== false)
        .map((variant: { image?: unknown }) => variant.image)
        .filter(
          (image: unknown): image is string =>
            typeof image === "string" && !!image,
        )
    : [];
  const rawImages = [
    product.coverImage,
    ...(product.images ?? []),
    ...variantImages,
  ].filter(
    (image): image is string =>
      typeof image === "string" && image.trim() !== "",
  );
  const gallery = Array.from(new Set(rawImages));
  const variants: ProductVariant[] = Array.isArray(product.variants)
    ? product.variants
        .map(
          (variant: {
            _id?: unknown;
            label?: string;
            options?: Array<{ name?: string; value?: string }>;
            price?: number;
            finalPrice?: number;
            stock?: number;
            image?: string;
            active?: boolean;
          }) => ({
            _id: String(variant._id ?? ""),
            label: variant.label ?? "",
            options: Array.isArray(variant.options)
              ? variant.options
                  .map((option) => ({
                    name: option.name ?? "",
                    value: option.value ?? "",
                  }))
                  .filter((option) => option.name && option.value)
              : [],
            ...(typeof variant.price === "number"
              ? { price: variant.price }
              : {}),
            finalPrice: Number(variant.finalPrice ?? product.finalPrice ?? 0),
            stock: Number(variant.stock ?? 0),
            ...(variant.image ? { image: variant.image } : {}),
            active: variant.active !== false,
          }),
        )
        .filter((variant: ProductVariant) => variant.active)
    : [];
  const startingPrice =
    variants.length > 0
      ? Math.min(...variants.map((variant) => variant.finalPrice))
      : Number(product.finalPrice ?? 0);

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
      <ProductViewTracker
        product={{
          coverImage: product.coverImage,
          finalPrice: product.finalPrice,
          name: product.name,
          slug: product.slug,
        }}
        productId={productId}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          className="mb-6"
          items={[
            { label: "Accueil", href: "/" },
            { label: "Produits", href: "/products" },
            { label: product.name },
          ]}
        />

        <ProductVariationImageProvider defaultImage={product.coverImage}>
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
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {product.topSeller && (
                      <Badge className="border-amber-300 bg-amber-100 text-amber-900">
                        Top seller
                      </Badge>
                    )}
                    <Badge
                      variant={inStock ? "secondary" : "destructive"}
                      className={
                        inStock
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }
                    >
                      {inStock ? "En stock" : "Rupture de stock"}
                    </Badge>
                  </div>
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
                  <span>0 avis</span>
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
                      {variants.length > 0 ? "À partir de " : ""}
                      {formatDZD(startingPrice)}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-accent-300 pb-1 text-sm line-through">
                        {formatDZD(product.price)}
                      </span>
                    )}
                    {product.discount > 0 && (
                      <Badge className="text-primary-700 bg-white">
                        {product.discount}% de remise
                      </Badge>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-primary-700 mt-2 text-sm font-medium">
                      Vous économisez {formatDZD(savings)} sur ce produit.
                    </p>
                  )}
                </div>

                {/* <div className="mt-5">
                  <p className="text-accent-500 line-clamp-3 text-sm leading-6">
                    {productSummary}
                  </p>
                  <Link
                    href="#description"
                    className="text-primary mt-2 inline-flex text-sm font-semibold hover:underline"
                  >
                    Tous les détails du produit ci-dessous
                  </Link>
                </div> */}

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
                        Les commandes sont confirmées par notre équipe avant la
                        livraison.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <ProductPurchasePanel
                      productId={productId}
                      variants={variants}
                      baseProduct={{
                        name: product.name,
                        coverImage: product.coverImage,
                        finalPrice: startingPrice,
                        slug: product.slug,
                        stock: stockCount,
                      }}
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
                      Catégories
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
                              {category.name ?? "Catégorie"}
                            </Link>
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </ProductVariationImageProvider>

        <ProductInfoTabs
          brand={displayBrand}
          categories={categoryNames}
          description={descriptionHtml}
          specs={specs}
          stockLabel={additionalStockLabel}
        />
      </div>

      <ProductRecommendationCarousel
        title="Produits recommandés"
        description="Découvrez des produits sélectionnés pour compléter cet article ou vous offrir une excellente alternative."
        products={recommendations.recommended}
      />
    </div>
  );
}
