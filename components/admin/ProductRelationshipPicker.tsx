"use client";

import Image from "next/image";
import { Plus, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDZD } from "@/lib/utils";

const FALLBACK_IMAGE = "/images/accessories.png";
const RESULT_LIMIT = 12;
const SELECTION_LIMIT = 8;

export type RelationshipProductOption = {
  _id: string;
  coverImage?: string;
  finalPrice?: number;
  name: string;
  stock?: number;
};

type ProductRelationshipPickerProps = {
  description: string;
  excludeId?: string;
  initialProducts?: RelationshipProductOption[];
  label: string;
  onChange: (productIds: string[]) => void;
  value: string[];
};

export default function ProductRelationshipPicker({
  description,
  excludeId,
  initialProducts = [],
  label,
  onChange,
  value,
}: ProductRelationshipPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<RelationshipProductOption[]>([]);
  const [knownProducts, setKnownProducts] =
    useState<RelationshipProductOption[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(true);
  const debounceRef = useRef<number | null>(null);

  const productMap = useMemo(
    () =>
      new Map(
        [...knownProducts, ...results].map((product) => [product._id, product]),
      ),
    [knownProducts, results],
  );
  const selectedProducts = value
    .map((productId) => productMap.get(productId))
    .filter((product): product is RelationshipProductOption =>
      Boolean(product),
    );

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);

    const controller = new AbortController();
    debounceRef.current = window.setTimeout(() => {
      const run = async () => {
        try {
          setIsLoading(true);
          const params = new URLSearchParams({
            limit: String(RESULT_LIMIT),
          });
          if (query.trim()) params.set("q", query.trim());
          if (excludeId) params.set("exclude", excludeId);

          const response = await fetch(`/api/admin/products?${params}`, {
            signal: controller.signal,
          });
          if (!response.ok) return;

          const data = (await response.json()) as {
            products?: Array<
              Omit<RelationshipProductOption, "_id"> & { _id?: unknown }
            >;
          };
          setResults(
            (data.products ?? []).map((product) => ({
              ...product,
              _id: String(product._id ?? ""),
            })),
          );
        } catch (error) {
          if ((error as { name?: string })?.name !== "AbortError") {
            setResults([]);
          }
        } finally {
          setIsLoading(false);
        }
      };

      void run();
    }, 250);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [excludeId, query]);

  const addProduct = (product: RelationshipProductOption) => {
    if (value.includes(product._id) || value.length >= SELECTION_LIMIT) return;

    onChange([...value, product._id]);
    setKnownProducts((current) =>
      current.some((item) => item._id === product._id)
        ? current
        : [...current, product],
    );
  };

  const removeProduct = (productId: string) => {
    onChange(value.filter((id) => id !== productId));
  };

  return (
    <div className="space-y-4 rounded-xl border bg-slate-50/60 p-4">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{label}</h3>
          <Badge variant="outline">
            {value.length}/{SELECTION_LIMIT}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">{description}</p>
      </div>

      {selectedProducts.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {selectedProducts.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-3 rounded-lg border bg-white p-2"
            >
              <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                <Image
                  fill
                  src={product.coverImage || FALLBACK_IMAGE}
                  alt=""
                  className="object-cover"
                  unoptimized={/^https?:\/\//i.test(product.coverImage ?? "")}
                  sizes="44px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{product.name}</p>
                <p className="text-muted-foreground text-[11px]">
                  {formatDZD(Number(product.finalPrice ?? 0))}
                </p>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                aria-label={`Retirer ${product.name}`}
                onClick={() => removeProduct(product._id)}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-3 size-4" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher des produits à ajouter..."
          className="pl-9"
        />
      </div>

      <div className="max-h-72 divide-y overflow-y-auto rounded-lg border bg-white">
        {isLoading && (
          <p className="text-muted-foreground px-3 py-4 text-xs">
            Recherche de produits...
          </p>
        )}
        {!isLoading && results.length === 0 && (
          <p className="text-muted-foreground px-3 py-4 text-xs">
            Aucun produit correspondant.
          </p>
        )}
        {!isLoading &&
          results.map((product) => {
            const selected = value.includes(product._id);
            const outOfStock = Number(product.stock ?? 0) <= 0;

            return (
              <div
                key={product._id}
                className="flex items-center gap-3 px-3 py-2.5"
              >
                <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-zinc-100">
                  <Image
                    fill
                    src={product.coverImage || FALLBACK_IMAGE}
                    alt=""
                    className="object-cover"
                    unoptimized={/^https?:\/\//i.test(product.coverImage ?? "")}
                    sizes="40px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{product.name}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {formatDZD(Number(product.finalPrice ?? 0))}
                    {outOfStock ? " - Rupture de stock" : ""}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  aria-label={`Ajouter ${product.name}`}
                  disabled={
                    selected || outOfStock || value.length >= SELECTION_LIMIT
                  }
                  onClick={() => addProduct(product)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
