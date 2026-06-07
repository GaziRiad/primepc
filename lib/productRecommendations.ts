import { unstable_cache } from "next/cache";

import { CACHE_TAGS, PUBLIC_PAGE_REVALIDATE_SECONDS } from "@/lib/cache";
import startDbConnection from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";

const RECOMMENDATION_LIMIT = 8;

type CandidateDocument = {
  _id?: unknown;
  name?: string;
  brand?: string;
  slug?: string;
  coverImage?: string;
  images?: unknown[];
  price?: number;
  finalPrice?: number;
  discount?: number;
  recommendationPriority?: number;
  updatedAt?: Date;
};

type RelationshipDocument = {
  categories?: unknown[];
  recommendedProducts?: unknown[];
  similarProducts?: unknown[];
  accessoryProducts?: unknown[];
};

export type RecommendedProduct = {
  _id: string;
  brand: string;
  discount: number;
  finalPrice: number;
  image: string;
  name: string;
  price: number;
  slug: string;
};

export type ProductRecommendations = {
  recommended: RecommendedProduct[];
};

const toId = (value: unknown) => String(value ?? "").trim();

const toRecommendedProduct = (
  product: CandidateDocument,
): RecommendedProduct => ({
  _id: toId(product._id),
  brand: String(product.brand ?? ""),
  discount: Number(product.discount ?? 0),
  finalPrice: Number(product.finalPrice ?? 0),
  image:
    String(product.coverImage ?? "").trim() ||
    String(product.images?.[0] ?? "").trim(),
  name: String(product.name ?? ""),
  price: Number(product.price ?? 0),
  slug: String(product.slug ?? ""),
});

const sortCandidates = (
  products: CandidateDocument[],
  relationshipOrder: string[],
) => {
  const order = new Map(
    relationshipOrder.map((productId, index) => [productId, index]),
  );

  return products.sort((a, b) => {
    const priorityDifference =
      Number(b.recommendationPriority ?? 0) -
      Number(a.recommendationPriority ?? 0);
    if (priorityDifference !== 0) return priorityDifference;

    const orderDifference =
      (order.get(toId(a._id)) ?? Number.MAX_SAFE_INTEGER) -
      (order.get(toId(b._id)) ?? Number.MAX_SAFE_INTEGER);
    if (orderDifference !== 0) return orderDifference;

    const discountDifference =
      Number(b.discount ?? 0) - Number(a.discount ?? 0);
    if (discountDifference !== 0) return discountDifference;

    return (
      Number(new Date(b.updatedAt ?? 0)) - Number(new Date(a.updatedAt ?? 0))
    );
  });
};

const candidateProjection =
  "name brand slug coverImage images.0 price finalPrice discount recommendationPriority updatedAt";

export const getProductRecommendationsUncached = async (
  productId: string,
): Promise<ProductRecommendations> => {
  await startDbConnection();

  const product = (await Product.findById(productId)
    .select("categories recommendedProducts similarProducts accessoryProducts")
    .lean()) as RelationshipDocument | null;

  if (!product) return { recommended: [] };

  const savedIds = (product.recommendedProducts ?? [])
    .map(toId)
    .filter(Boolean);
  const legacyIds = [
    ...(product.similarProducts ?? []),
    ...(product.accessoryProducts ?? []),
  ]
    .map(toId)
    .filter(Boolean);
  const manualIds = Array.from(
    new Set(savedIds.length > 0 ? savedIds : legacyIds),
  );
  const excludedIds = new Set([productId]);
  const manualCandidates =
    manualIds.length > 0
      ? ((await Product.find({
          _id: { $in: manualIds, $ne: productId },
          stock: { $gt: 0 },
        })
          .select(candidateProjection)
          .lean()) as CandidateDocument[])
      : [];
  const manualCandidatesById = new Map(
    manualCandidates.map((candidate) => [toId(candidate._id), candidate]),
  );

  let candidates: CandidateDocument[] = [];
  if (manualIds.length > 0) {
    candidates = manualIds
      .map((id) => manualCandidatesById.get(id))
      .filter((candidate): candidate is CandidateDocument =>
        Boolean(candidate),
      );
  } else {
    const categoryIds = (product.categories ?? []).map(toId).filter(Boolean);
    const categories =
      categoryIds.length > 0
        ? (
            await Category.find({
              _id: { $in: categoryIds },
              isActive: true,
            }).distinct("_id")
          ).map(toId)
        : [];
    if (categories.length > 0) {
      candidates = (await Product.find({
        _id: { $ne: productId },
        categories: { $in: categories },
        stock: { $gt: 0 },
      })
        .select(candidateProjection)
        .sort({ recommendationPriority: -1, discount: -1, updatedAt: -1 })
        .limit(RECOMMENDATION_LIMIT)
        .lean()) as CandidateDocument[];
    }
  }

  const recommended = sortCandidates(candidates, manualIds)
    .filter((candidate) => {
      const id = toId(candidate._id);
      if (!id || excludedIds.has(id)) return false;
      excludedIds.add(id);
      return true;
    })
    .slice(0, RECOMMENDATION_LIMIT)
    .map(toRecommendedProduct);

  return { recommended };
};

const getProductRecommendationsCached = unstable_cache(
  getProductRecommendationsUncached,
  ["product-recommendations"],
  {
    revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.products, CACHE_TAGS.categories],
  },
);

export const getProductRecommendations = (productId: string) =>
  getProductRecommendationsCached(productId);
