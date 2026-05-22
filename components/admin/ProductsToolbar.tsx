"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STOCK_OPTIONS = [
  { value: "all", label: "All stock" },
  { value: "in", label: "In stock" },
  { value: "out", label: "Out of stock" },
];

type ProductsToolbarProps = {
  initialQuery?: string;
  initialStock?: string;
};

export default function ProductsToolbar({
  initialQuery = "",
  initialStock = "all",
}: ProductsToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [stock, setStock] = useState(initialStock || "all");

  const updateParams = (next: { q?: string; stock?: string }) => {
    const params = new URLSearchParams();
    const nextQuery = typeof next.q === "string" ? next.q : query.trim();
    const nextStock = typeof next.stock === "string" ? next.stock : stock;

    if (nextQuery) params.set("q", nextQuery);
    if (nextStock && nextStock !== "all") params.set("stock", nextStock);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ q: query.trim(), stock });
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={handleSubmit} className="flex w-full flex-1 gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products..."
          className="w-full"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <Select
          value={stock}
          onValueChange={(value) => {
            setStock(value);
            updateParams({ q: query.trim(), stock: value });
          }}
        >
          <SelectTrigger size="sm" className="w-full sm:w-40">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            {STOCK_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button asChild>
          <Link href="/admin/products/new">New product</Link>
        </Button>
      </div>
    </div>
  );
}
