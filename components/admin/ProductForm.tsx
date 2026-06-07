"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import ImageUploadButton from "@/components/admin/ImageUploadButton";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { formatDZD, getDiscountedPrice } from "@/lib/utils";
import {
  buildVariantKey,
  generateVariantOptions,
  getVariationGroupsFromVariants,
  getVariantCombinationCount,
  MAX_PRODUCT_VARIANTS,
  type ProductVariationGroup,
} from "@/lib/productVariants";

const FALLBACK_IMAGE = "/images/accessories.png";

type CategoryOption = {
  _id: string;
  name: string;
  slug?: string;
  isActive?: boolean;
};

type ProductFormProduct = {
  _id: string;
  name: string;
  slug?: string;
  brand?: string;
  description?: string;
  price?: number;
  discount?: number;
  stock?: number;
  coverImage?: string;
  images?: string[];
  categories?: string[];
  specs?: Record<string, string>;
  variants?: ProductVariantRow[];
};

type SpecRow = { key: string; value: string };
type ProductVariantRow = {
  _id?: string;
  active: boolean;
  label: string;
  options: Array<{ name: string; value: string }>;
  price?: number;
  stock: number;
  image?: string;
};

type ProductFormProps = {
  mode: "create" | "edit";
  product?: ProductFormProduct;
  categories: CategoryOption[];
};

export default function ProductForm({
  mode,
  product,
  categories,
}: ProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(product?.name ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(
    product?.price ? String(product.price) : "",
  );
  const [discount, setDiscount] = useState(
    product?.discount ? String(product.discount) : "0",
  );
  const [stock, setStock] = useState(
    typeof product?.stock === "number" ? String(product.stock) : "0",
  );
  const [coverImage, setCoverImage] = useState(product?.coverImage ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [specs, setSpecs] = useState<SpecRow[]>(() => {
    if (!product?.specs) return [];
    return Object.entries(product.specs).map(([key, value]) => ({
      key,
      value,
    }));
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    product?.categories ?? [],
  );
  const [variationGroups, setVariationGroups] = useState<
    ProductVariationGroup[]
  >(() => getVariationGroupsFromVariants(product?.variants));
  const [variants, setVariants] = useState<ProductVariantRow[]>(
    () =>
      product?.variants?.map((variant) => ({
        ...variant,
        active: variant.active !== false,
      })) ?? [],
  );
  const [isSaving, setIsSaving] = useState(false);

  const finalPrice = useMemo(() => {
    const priceValue = Number(price);
    const discountValue = Number(discount);
    if (!Number.isFinite(priceValue)) return 0;
    return getDiscountedPrice(
      priceValue,
      Number.isFinite(discountValue) ? discountValue : 0,
    );
  }, [price, discount]);

  const variantStock = useMemo(
    () =>
      variants.reduce((total, variant) => {
        const value = Number(variant.stock ?? 0);
        return (
          total +
          (variant.active && Number.isFinite(value) && value > 0 ? value : 0)
        );
      }, 0),
    [variants],
  );

  const handleImageChange = (index: number, value: string) => {
    setImages((current) =>
      current.map((item, idx) => (idx === index ? value : item)),
    );
  };

  const handleImageRemove = (index: number) => {
    setImages((current) => current.filter((_, idx) => idx !== index));
  };

  const handleSpecChange = (
    index: number,
    key: keyof SpecRow,
    value: string,
  ) => {
    setSpecs((current) =>
      current.map((row, idx) =>
        idx === index ? { ...row, [key]: value } : row,
      ),
    );
  };

  const handleSpecRemove = (index: number) => {
    setSpecs((current) => current.filter((_, idx) => idx !== index));
  };

  const toggleCategory = (categoryId: string, checked: boolean) => {
    setSelectedCategories((current) => {
      if (checked) return [...current, categoryId];
      return current.filter((id) => id !== categoryId);
    });
  };

  const updateVariant = (
    index: number,
    field: "active" | "price" | "stock" | "image",
    value: string | boolean,
  ) => {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]:
                field === "active"
                  ? Boolean(value)
                  : field === "price"
                    ? value === ""
                      ? undefined
                      : Number(value)
                    : field === "stock"
                      ? Number(value)
                      : String(value),
            }
          : variant,
      ),
    );
  };

  const updateVariationGroup = (
    index: number,
    field: "name" | "values",
    value: string,
  ) => {
    setVariationGroups((current) =>
      current.map((group, groupIndex) =>
        groupIndex === index
          ? {
              ...group,
              [field]:
                field === "values"
                  ? value.split(",").map((item) => item.trim())
                  : value,
            }
          : group,
      ),
    );
  };

  const buildCombinations = (
    groups: ProductVariationGroup[],
    currentVariants: ProductVariantRow[],
  ) => {
    const existingByKey = new Map(
      currentVariants.map((variant) => [
        buildVariantKey(variant.options),
        variant,
      ]),
    );

    return generateVariantOptions(groups).map((options) => {
      const existing = existingByKey.get(buildVariantKey(options));
      return {
        ...existing,
        active: existing?.active !== false,
        label: options.map((option) => option.value).join(" / "),
        options,
        stock: Number(existing?.stock ?? 0),
      };
    });
  };

  const refreshCombinations = () => {
    const combinationCount = getVariantCombinationCount(variationGroups);
    if (combinationCount > MAX_PRODUCT_VARIANTS) {
      toast.error(
        `This setup creates ${combinationCount} combinations. Keep it to ${MAX_PRODUCT_VARIANTS} or fewer.`,
      );
      return;
    }

    const next = buildCombinations(variationGroups, variants);
    setVariants(next);
    if (next.length === 0 && variationGroups.length > 0) {
      toast.error("Add at least one value to every option group.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nameValue = name.trim();
    const coverValue = coverImage.trim();
    const priceValue = Number(price);
    const discountValue = Number(discount);
    const stockValue = Number(stock);

    if (!nameValue) {
      toast.error("Name is required.");
      return;
    }

    if (!coverValue) {
      toast.error("Cover image URL is required.");
      return;
    }

    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast.error("Price must be a positive number.");
      return;
    }

    const cleanedGroups = variationGroups
      .map((group) => ({
        name: group.name.trim(),
        values: Array.from(
          new Set(group.values.map((value) => value.trim()).filter(Boolean)),
        ),
      }))
      .filter((group) => group.name || group.values.length > 0);

    if (
      cleanedGroups.some((group) => !group.name || group.values.length === 0)
    ) {
      toast.error("Every option needs a name and at least one value.");
      return;
    }

    const groupNames = cleanedGroups.map((group) => group.name.toLowerCase());
    if (new Set(groupNames).size !== groupNames.length) {
      toast.error("Option names must be unique.");
      return;
    }

    const combinationCount = getVariantCombinationCount(cleanedGroups);
    if (combinationCount > MAX_PRODUCT_VARIANTS) {
      toast.error(
        `This setup creates ${combinationCount} combinations. Keep it to ${MAX_PRODUCT_VARIANTS} or fewer.`,
      );
      return;
    }

    const generatedVariants = buildCombinations(cleanedGroups, variants);
    const normalizedVariants = generatedVariants.map((variant) => ({
      ...variant,
      active: variant.active !== false,
      label:
        variant.options.map((option) => option.value).join(" / ") ||
        variant.label.trim(),
      image: variant.image?.trim() || "",
      options: variant.options
        .map((option) => ({
          name: option.name.trim(),
          value: option.value.trim(),
        }))
        .filter((option) => option.name && option.value),
      price:
        typeof variant.price === "number" && Number.isFinite(variant.price)
          ? variant.price
          : undefined,
      stock:
        Number.isFinite(Number(variant.stock)) && Number(variant.stock) > 0
          ? Math.floor(Number(variant.stock))
          : 0,
    }));

    if (
      normalizedVariants.some(
        (variant) =>
          variant.options.length === 0 ||
          (variant.price !== undefined && variant.price < 100),
      )
    ) {
      toast.error("Each variation needs options and a valid optional price.");
      return;
    }

    const payload = {
      name: nameValue,
      brand: brand.trim(),
      description: description.trim(),
      price: priceValue,
      discount: Number.isFinite(discountValue) ? discountValue : 0,
      stock:
        normalizedVariants.length > 0
          ? normalizedVariants.reduce(
              (total, variant) => total + (variant.active ? variant.stock : 0),
              0,
            )
          : Number.isFinite(stockValue)
            ? stockValue
            : 0,
      coverImage: coverValue,
      images: images.map((item) => item.trim()).filter(Boolean),
      categories: selectedCategories,
      specs: specs
        .map((row) => ({
          key: row.key.trim(),
          value: row.value.trim(),
        }))
        .filter((row) => row.key && row.value)
        .reduce<Record<string, string>>((acc, row) => {
          acc[row.key] = row.value;
          return acc;
        }, {}),
      variants: normalizedVariants,
    };

    setIsSaving(true);
    try {
      const endpoint =
        mode === "create"
          ? "/api/admin/products"
          : `/api/admin/products/${product?._id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        toast.error(data?.error || "Unable to save product.");
        return;
      }

      toast.success(
        mode === "create" ? "Product created." : "Product updated.",
      );
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Unable to save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-xs">
        <h2 className="text-foreground text-lg font-semibold">Basics</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Core details that appear on product listings.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand</label>
            <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price (DZD)</label>
            <Input
              type="number"
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Discount (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="1"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {variants.length > 0 ? "Total variation stock" : "Stock"}
            </label>
            <Input
              type="number"
              min="0"
              step="1"
              value={variants.length > 0 ? String(variantStock) : stock}
              onChange={(e) => setStock(e.target.value)}
              disabled={variants.length > 0}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Final price preview</label>
            <div className="border-input bg-input/30 flex h-9 items-center rounded-4xl border px-3 text-sm">
              {formatDZD(finalPrice)}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <label className="text-sm font-medium">Description</label>
          <RichTextEditor value={description} onChange={setDescription} />
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Variations
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
              Optional. Define options once, then manage stock for every
              generated combination.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={variationGroups.length >= 4}
            onClick={() =>
              setVariationGroups((current) => [
                ...current,
                {
                  name: current.length === 0 ? "Color" : "",
                  values: [],
                },
              ])
            }
          >
            Add option
          </Button>
        </div>

        {variationGroups.length === 0 ? (
          <div className="text-muted-foreground mt-6 rounded-xl border border-dashed px-4 py-6 text-sm">
            This is a simple product. Add an option such as Color to create
            separate stock entries for Black, Blue, and other values.
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              {variationGroups.map((group, groupIndex) => (
                <div
                  key={`variation-group-${groupIndex}`}
                  className="grid gap-3 rounded-xl border bg-slate-50/60 p-4 md:grid-cols-[0.65fr_1.35fr_auto]"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Option name</label>
                    <Input
                      value={group.name}
                      placeholder="Color"
                      onChange={(event) =>
                        updateVariationGroup(
                          groupIndex,
                          "name",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Values, separated by commas
                    </label>
                    <Input
                      value={group.values.join(", ")}
                      placeholder="Black, Blue, Red"
                      onChange={(event) =>
                        updateVariationGroup(
                          groupIndex,
                          "values",
                          event.target.value,
                        )
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="self-end"
                    onClick={() => {
                      const nextGroups = variationGroups.filter(
                        (_, index) => index !== groupIndex,
                      );
                      setVariationGroups(nextGroups);
                      setVariants((current) =>
                        buildCombinations(nextGroups, current),
                      );
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">
                  Example: Color with Black, Blue creates one stock row per
                  color. Add Size to create color and size combinations.
                </p>
                <Button
                  type="button"
                  onClick={refreshCombinations}
                  variant="secondary"
                >
                  Generate combinations
                </Button>
              </div>
            </div>

            {variants.length > 0 && (
              <div className="overflow-x-auto rounded-xl border">
                <div className="min-w-[760px]">
                  <div className="grid grid-cols-[minmax(150px,1.4fr)_90px_minmax(130px,0.8fr)_minmax(180px,1fr)] gap-3 border-b bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500">
                    <span>Combination</span>
                    <span>Available</span>
                    <span>Stock</span>
                    <span>Price override</span>
                  </div>
                  <div className="divide-y">
                    {variants.map((variant, variantIndex) => (
                      <div
                        key={
                          variant._id ??
                          buildVariantKey(variant.options) ??
                          `variant-${variantIndex}`
                        }
                        className="grid grid-cols-[minmax(150px,1.4fr)_90px_minmax(130px,0.8fr)_minmax(180px,1fr)] items-center gap-3 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{variant.label}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {variant.options.map((option) => (
                              <Badge
                                key={`${option.name}-${option.value}`}
                                variant="outline"
                                className="text-[10px]"
                              >
                                {option.name}: {option.value}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Input
                              value={variant.image ?? ""}
                              className="h-8 text-xs"
                              placeholder="Optional image URL"
                              onChange={(event) =>
                                updateVariant(
                                  variantIndex,
                                  "image",
                                  event.target.value,
                                )
                              }
                            />
                            <ImageUploadButton
                              label="Upload"
                              onUpload={(url) =>
                                updateVariant(variantIndex, "image", url)
                              }
                            />
                          </div>
                        </div>
                        <Checkbox
                          checked={variant.active}
                          aria-label={`Make ${variant.label} available`}
                          onCheckedChange={(value) =>
                            updateVariant(
                              variantIndex,
                              "active",
                              Boolean(value),
                            )
                          }
                        />
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={String(variant.stock ?? 0)}
                          disabled={!variant.active}
                          onChange={(event) =>
                            updateVariant(
                              variantIndex,
                              "stock",
                              event.target.value,
                            )
                          }
                        />
                        <Input
                          type="number"
                          min="100"
                          step="1"
                          value={
                            typeof variant.price === "number"
                              ? String(variant.price)
                              : ""
                          }
                          disabled={!variant.active}
                          placeholder={`Base: ${formatDZD(finalPrice)}`}
                          onChange={(event) =>
                            updateVariant(
                              variantIndex,
                              "price",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-xs">
        <h2 className="text-foreground text-lg font-semibold">Images</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Upload images or paste URLs. Cover image is required.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <label className="text-sm font-medium">Cover image</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Paste image URL"
              />
              <ImageUploadButton
                label="Upload cover"
                onUpload={(url) => setCoverImage(url)}
              />
            </div>
            <div className="relative h-56 overflow-hidden rounded-2xl border bg-zinc-100">
              <Image
                fill
                src={coverImage || FALLBACK_IMAGE}
                alt={name || "Cover preview"}
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-medium">Gallery images</label>
              <ImageUploadButton
                label="Upload image"
                onUpload={(url) => setImages((current) => [...current, url])}
              />
            </div>
            {images.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No gallery images yet.
              </p>
            )}
            <div className="space-y-3">
              {images.map((image, index) => (
                <div key={`image-${index}`} className="flex gap-2">
                  <Input
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleImageRemove(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImages((current) => [...current, ""])}
            >
              Add image URL
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-xs">
        <h2 className="text-foreground text-lg font-semibold">Categories</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Assign the product to one or more categories.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No categories available. Create one in{" "}
              <Link href="/admin/categories" className="text-primary">
                Categories
              </Link>
              .
            </p>
          ) : (
            categories.map((category) => {
              const checked = selectedCategories.includes(category._id);
              const inactive = category.isActive === false;

              return (
                <label
                  key={category._id}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm"
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      toggleCategory(category._id, Boolean(value))
                    }
                  />
                  <span>{category.name}</span>
                  {inactive && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      Inactive
                    </Badge>
                  )}
                </label>
              );
            })
          )}
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-lg font-semibold">Specs</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Add key specs like RAM, storage, or GPU.
            </p>
          </div>
          <Badge variant="outline">Optional</Badge>
        </div>

        <div className="mt-6 space-y-3">
          {specs.length === 0 && (
            <p className="text-muted-foreground text-sm">No specs added yet.</p>
          )}
          {specs.map((spec, index) => (
            <div key={`spec-${index}`} className="flex gap-2">
              <Input
                placeholder="Label (e.g. RAM)"
                value={spec.key}
                onChange={(e) => handleSpecChange(index, "key", e.target.value)}
              />
              <Input
                placeholder="Value (e.g. 16GB)"
                value={spec.value}
                onChange={(e) =>
                  handleSpecChange(index, "value", e.target.value)
                }
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSpecRemove(index)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() =>
            setSpecs((current) => [...current, { key: "", value: "" }])
          }
        >
          Add spec
        </Button>
      </section>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? "Saving..."
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
