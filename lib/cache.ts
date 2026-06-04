import { revalidatePath, revalidateTag } from "next/cache";

export const PUBLIC_PAGE_REVALIDATE_SECONDS = 60;
export const MARKETING_REVALIDATE_SECONDS = 300;

export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  marketing: "marketing",
} as const;

const expireImmediately = { expire: 0 };

export const revalidateProductCache = (
  slugs: Array<string | undefined> = [],
) => {
  revalidateTag(CACHE_TAGS.products, expireImmediately);
  revalidatePath("/");
  revalidatePath("/products");

  for (const slug of slugs) {
    if (slug) revalidatePath(`/products/${slug}`);
  }
};

export const revalidateCategoryCache = () => {
  revalidateTag(CACHE_TAGS.categories, expireImmediately);
  revalidateTag(CACHE_TAGS.products, expireImmediately);
  revalidatePath("/");
  revalidatePath("/products");
};

export const revalidateMarketingCache = () => {
  revalidateTag(CACHE_TAGS.marketing, expireImmediately);
  revalidatePath("/");
};
