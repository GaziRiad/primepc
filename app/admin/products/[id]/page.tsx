import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminAuth";
import { Types } from "mongoose";

import Category from "@/models/Category";
import Product from "@/models/Product";
import startDbConnection from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const metadata: Metadata = {
  title: "Modifier le produit - Administration",
};

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    notFound();
  }

  await startDbConnection();

  const product = await Product.findById(id).lean();
  if (!product) {
    notFound();
  }

  const categories = await Category.find()
    .select("name slug isActive")
    .sort({ name: 1 })
    .lean();

  const safeCategories = categories.map((category) => ({
    _id: String(category._id),
    name: category.name,
    slug: category.slug,
    isActive: Boolean(category.isActive),
  }));

  const specs =
    product.specs instanceof Map
      ? Object.fromEntries(product.specs)
      : ((product.specs as Record<string, string> | undefined) ?? {});
  const toRelationshipIds = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.map((relatedId: unknown) => String(relatedId))
      : [];
  const savedRecommendations = toRelationshipIds(product.recommendedProducts);
  const legacyRecommendations = [
    ...toRelationshipIds(product.similarProducts),
    ...toRelationshipIds(product.accessoryProducts),
  ];
  const relationshipIds: string[] = Array.from(
    new Set<string>(
      savedRecommendations.length > 0
        ? savedRecommendations
        : legacyRecommendations,
    ),
  );
  const relationshipDocs =
    relationshipIds.length > 0
      ? await Product.find({ _id: { $in: relationshipIds } })
          .select("name coverImage finalPrice stock")
          .lean()
      : [];
  const relationshipProducts = relationshipDocs.map((relatedProduct) => ({
    _id: String(relatedProduct._id),
    name: relatedProduct.name,
    coverImage: relatedProduct.coverImage ?? "",
    finalPrice: Number(relatedProduct.finalPrice ?? 0),
    stock: Number(relatedProduct.stock ?? 0),
  }));
  const existingRelationshipIds = new Set(
    relationshipProducts.map((relatedProduct) => relatedProduct._id),
  );
  const safeRecommendedProducts = relationshipIds.filter((relatedId: string) =>
    existingRelationshipIds.has(relatedId),
  );

  const safeProduct = {
    _id: String(product._id),
    name: product.name,
    slug: product.slug,
    brand: product.brand ?? "",
    description: product.description ?? "",
    price: Number(product.price ?? 0),
    discount: Number(product.discount ?? 0),
    finalPrice: Number(product.finalPrice ?? 0),
    stock: Number(product.stock ?? 0),
    coverImage: product.coverImage ?? "",
    images: Array.isArray(product.images) ? product.images : [],
    categories: Array.isArray(product.categories)
      ? product.categories.map((category: unknown) => String(category))
      : [],
    specs,
    variants: Array.isArray(product.variants)
      ? product.variants.map(
          (variant: {
            _id?: unknown;
            label?: string;
            options?: Array<{ name?: string; value?: string }>;
            price?: number;
            stock?: number;
            image?: string;
            active?: boolean;
          }) => ({
            _id: String(variant._id),
            label: variant.label ?? "",
            options: Array.isArray(variant.options)
              ? variant.options.map(
                  (option: { name?: string; value?: string }) => ({
                    name: option.name ?? "",
                    value: option.value ?? "",
                  }),
                )
              : [],
            price:
              typeof variant.price === "number"
                ? Number(variant.price)
                : undefined,
            stock: Number(variant.stock ?? 0),
            image: variant.image ?? "",
            active: variant.active !== false,
          }),
        )
      : [],
    recommendationPriority: Number(product.recommendationPriority ?? 0),
    recommendedProducts: safeRecommendedProducts,
    topSeller: Boolean(product.topSeller),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Modifier le produit
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Modifiez les informations, les prix et le stock du produit.
        </p>
      </div>

      <ProductForm
        mode="edit"
        product={safeProduct}
        categories={safeCategories}
        relationshipProducts={relationshipProducts}
      />
    </div>
  );
}
