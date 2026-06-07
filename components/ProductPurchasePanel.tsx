"use client";

import { useMemo, useState } from "react";

import AddToCartButton from "@/components/AddToCartButton";
import FavoriteButton from "@/components/(user)/FavoriteButton";
import { Badge } from "@/components/ui/badge";
import { formatDZD } from "@/lib/utils";
import { useProductVariationImage } from "@/components/ProductVariationImageContext";
import type {
  ProductVariant,
  ProductVariantOption,
} from "@/lib/productVariants";

type ProductPurchasePanelProps = {
  baseProduct: {
    coverImage: string;
    finalPrice: number;
    name: string;
    slug: string;
    stock: number;
  };
  productId: string;
  variants: ProductVariant[];
};

const optionMatches = (
  variant: ProductVariant,
  selections: Record<string, string>,
  ignoredName?: string,
) =>
  Object.entries(selections).every(([name, value]) => {
    if (name === ignoredName) return true;
    return variant.options.some(
      (option) => option.name === name && option.value === value,
    );
  });

const findOption = (
  options: ProductVariantOption[],
  name: string,
  value: string,
) => options.some((option) => option.name === name && option.value === value);

export default function ProductPurchasePanel({
  baseProduct,
  productId,
  variants,
}: ProductPurchasePanelProps) {
  const variationImage = useProductVariationImage();
  const [selections, setSelections] = useState<Record<string, string>>({});
  const hasVariants = variants.length > 0;

  const optionGroups = useMemo(() => {
    const groups = new Map<string, string[]>();

    for (const variant of variants) {
      for (const option of variant.options) {
        const values = groups.get(option.name) ?? [];
        if (!values.includes(option.value)) values.push(option.value);
        groups.set(option.name, values);
      }
    }

    return Array.from(groups.entries());
  }, [variants]);

  const findSelectedVariant = (nextSelections: Record<string, string>) =>
    variants.find(
      (variant) =>
        optionGroups.length > 0 &&
        optionGroups.every(([name]) =>
          variant.options.some(
            (option) =>
              option.name === name && option.value === nextSelections[name],
          ),
        ),
    ) ?? null;

  const selectedVariant = findSelectedVariant(selections);

  const displayPrice = selectedVariant?.finalPrice ?? baseProduct.finalPrice;
  const displayStock = selectedVariant?.stock ?? baseProduct.stock;

  return (
    <div>
      {hasVariants && (
        <div className="mb-6 space-y-5 border-y py-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-foreground text-sm font-semibold">
                Choose your options
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                Select one value from each group before adding to cart.
              </p>
            </div>
            {selectedVariant && (
              <Badge
                variant={
                  selectedVariant.stock > 0 ? "secondary" : "destructive"
                }
                className={
                  selectedVariant.stock > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : ""
                }
              >
                {selectedVariant.stock > 0 ? "Available" : "Out of stock"}
              </Badge>
            )}
          </div>

          {optionGroups.map(([name, values]) => (
            <fieldset key={name}>
              <legend className="text-foreground mb-2 text-sm font-medium">
                {name}
              </legend>
              <div className="flex flex-wrap gap-2">
                {values.map((value) => {
                  const available = variants.some(
                    (variant) =>
                      variant.stock > 0 &&
                      findOption(variant.options, name, value) &&
                      optionMatches(variant, selections, name),
                  );
                  const selected = selections[name] === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!available}
                      aria-pressed={selected}
                      onClick={() => {
                        const nextSelections = { ...selections, [name]: value };
                        const nextVariant = findSelectedVariant(nextSelections);
                        variationImage?.setSelectedImage(
                          nextVariant?.image || baseProduct.coverImage,
                        );
                        setSelections(nextSelections);
                      }}
                      className={`min-h-10 rounded-lg border px-4 text-sm font-medium transition ${
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "hover:border-primary/40 border-slate-200 bg-white text-slate-700"
                      } disabled:cursor-not-allowed disabled:opacity-35`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-muted-foreground text-xs">
              {selectedVariant
                ? selectedVariant.label
                : "Complete your selection to see availability."}
            </p>
            <p className="text-primary-800 mt-1 text-xl font-semibold">
              {formatDZD(displayPrice)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <AddToCartButton
          productId={productId}
          variantId={selectedVariant?._id}
          requiresVariant={hasVariants}
          product={{
            name: baseProduct.name,
            coverImage: selectedVariant?.image || baseProduct.coverImage,
            finalPrice: displayPrice,
            slug: baseProduct.slug,
            stock: displayStock,
          }}
          variant={
            selectedVariant
              ? {
                  label: selectedVariant.label,
                  options: selectedVariant.options,
                }
              : undefined
          }
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
  );
}
