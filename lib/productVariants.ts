import { getDiscountedPrice } from "@/lib/utils";

export type ProductVariantOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  _id?: string;
  active: boolean;
  finalPrice: number;
  image?: string;
  label: string;
  options: ProductVariantOption[];
  price?: number;
  stock: number;
};

export type ProductVariationGroup = {
  name: string;
  values: string[];
};

export const MAX_PRODUCT_VARIANTS = 100;

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

const cleanText = (value: unknown, maxLength: number) =>
  String(value ?? "")
    .trim()
    .slice(0, maxLength);

const uniqueValues = (values: string[]) => {
  const seen = new Set<string>();

  return values.filter((value) => {
    const key = value.toLowerCase();
    if (!value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const normalizeVariationGroups = (groups: ProductVariationGroup[]) =>
  groups
    .map((group) => ({
      name: cleanText(group.name, 40),
      values: uniqueValues(
        group.values.map((value) => cleanText(value, 60)).filter(Boolean),
      ),
    }))
    .filter((group) => group.name && group.values.length > 0)
    .slice(0, 4);

export const formatVariantOptions = (options?: ProductVariantOption[]) =>
  (options ?? []).map((option) => `${option.name}: ${option.value}`).join(", ");

export const buildVariantKey = (options?: ProductVariantOption[]) =>
  (options ?? [])
    .map((option) => ({
      name: cleanText(option.name, 40).toLowerCase(),
      value: cleanText(option.value, 60).toLowerCase(),
    }))
    .filter((option) => option.name && option.value)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((option) => `${option.name}:${option.value}`)
    .join("|");

export const getVariationGroupsFromVariants = (
  variants?: Array<Pick<ProductVariant, "options">>,
) => {
  const groups = new Map<string, ProductVariationGroup>();

  for (const variant of variants ?? []) {
    for (const option of variant.options ?? []) {
      const normalizedName = option.name.trim().toLowerCase();
      if (!normalizedName || !option.value.trim()) continue;

      const group = groups.get(normalizedName) ?? {
        name: option.name.trim(),
        values: [],
      };
      if (
        !group.values.some(
          (value) => value.toLowerCase() === option.value.trim().toLowerCase(),
        )
      ) {
        group.values.push(option.value.trim());
      }
      groups.set(normalizedName, group);
    }
  }

  return Array.from(groups.values());
};

export const generateVariantOptions = (groups: ProductVariationGroup[]) => {
  const cleanGroups = normalizeVariationGroups(groups);

  if (cleanGroups.length === 0) return [] as ProductVariantOption[][];
  if (getVariantCombinationCount(cleanGroups) > MAX_PRODUCT_VARIANTS) {
    return [] as ProductVariantOption[][];
  }

  return cleanGroups.reduce<ProductVariantOption[][]>(
    (combinations, group) =>
      combinations.flatMap((combination) =>
        group.values.map((value) => [
          ...combination,
          { name: group.name, value },
        ]),
      ),
    [[]],
  );
};

export const getVariantCombinationCount = (groups: ProductVariationGroup[]) => {
  const cleanGroups = normalizeVariationGroups(groups);
  if (cleanGroups.length === 0) return 0;

  return cleanGroups.reduce((total, group) => total * group.values.length, 1);
};

export const parseProductVariants = (
  value: unknown,
  basePrice: number,
  discount: number,
) => {
  if (!Array.isArray(value)) return [] as ProductVariant[];

  const seen = new Set<string>();
  const variants: ProductVariant[] = [];

  for (const rawVariant of value.slice(0, MAX_PRODUCT_VARIANTS)) {
    if (!rawVariant || typeof rawVariant !== "object") continue;

    const source = rawVariant as Record<string, unknown>;
    const rawOptions = Array.isArray(source.options) ? source.options : [];
    const optionNames = new Set<string>();
    const options: ProductVariantOption[] = [];

    for (const rawOption of rawOptions.slice(0, 6)) {
      if (!rawOption || typeof rawOption !== "object") continue;
      const option = rawOption as Record<string, unknown>;
      const name = cleanText(option.name, 40);
      const optionValue = cleanText(option.value, 60);
      const normalizedName = name.toLowerCase();

      if (!name || !optionValue || optionNames.has(normalizedName)) continue;
      optionNames.add(normalizedName);
      options.push({ name, value: optionValue });
    }

    const key = buildVariantKey(options);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const rawPrice =
      source.price === "" || source.price === null || source.price === undefined
        ? undefined
        : Number(source.price);
    const price =
      typeof rawPrice === "number" &&
      Number.isFinite(rawPrice) &&
      rawPrice >= 100
        ? rawPrice
        : undefined;
    const rawStock = Math.floor(Number(source.stock ?? 0));
    const stock = Number.isFinite(rawStock) && rawStock > 0 ? rawStock : 0;
    const label =
      cleanText(source.label, 120) ||
      options.map((option) => option.value).join(" / ");
    const image = cleanText(source.image, 500);
    const id = cleanText(source._id, 24);

    variants.push({
      ...(OBJECT_ID_REGEX.test(id) ? { _id: id } : {}),
      active: source.active !== false,
      label,
      options,
      ...(price === undefined ? {} : { price }),
      finalPrice: getDiscountedPrice(price ?? basePrice, discount),
      stock,
      ...(image ? { image } : {}),
    });
  }

  return variants;
};
