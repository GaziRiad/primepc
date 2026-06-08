export type ProductQueryParams = {
  [key: string]: string | string[] | undefined;
};

const ALLOWED_SORTS = new Set(["finalPrice", "-finalPrice"]);
const MAX_CATEGORIES = 12;

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const cleanText = (value: string | undefined, maxLength: number) => {
  const clean = String(value ?? "").trim().slice(0, maxLength);
  return clean || undefined;
};

const cleanPositiveInteger = (
  value: string | undefined,
  maximum?: number,
) => {
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return maximum ? Math.min(parsed, maximum) : parsed;
};

const cleanNonNegativeNumber = (value: string | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? String(parsed) : undefined;
};

export const sanitizeProductQuery = (
  query?: ProductQueryParams,
): ProductQueryParams => {
  const sanitized: ProductQueryParams = {};
  const search = cleanText(toSingle(query?.q), 80);
  const minPrice = cleanNonNegativeNumber(toSingle(query?.minPrice));
  const maxPrice = cleanNonNegativeNumber(toSingle(query?.maxPrice));
  const page = cleanPositiveInteger(toSingle(query?.page));
  const limit = cleanPositiveInteger(toSingle(query?.limit), 48);
  const sort = toSingle(query?.sort);
  const topSeller = toSingle(query?.topSeller);
  const categories = (Array.isArray(query?.categories)
    ? query.categories
    : query?.categories
      ? [query.categories]
      : []
  )
    .map((value) => cleanText(value, 80))
    .filter((value): value is string => Boolean(value))
    .slice(0, MAX_CATEGORIES);

  if (search) sanitized.q = search;
  if (minPrice !== undefined) sanitized.minPrice = minPrice;
  if (maxPrice !== undefined) sanitized.maxPrice = maxPrice;
  if (page !== undefined) sanitized.page = String(page);
  if (limit !== undefined) sanitized.limit = String(limit);
  if (sort && ALLOWED_SORTS.has(sort)) sanitized.sort = sort;
  if (topSeller === "true" || topSeller === "false") {
    sanitized.topSeller = topSeller;
  }
  if (categories.length > 0) sanitized.categories = categories;

  return sanitized;
};
