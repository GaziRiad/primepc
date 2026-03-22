"use client";

import { useState, useTransition } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "../ui/field";
import { Slider } from "../ui/slider";
import FilterBlock from "./FilterBlock";
import FilterRanges from "./FilterRanges";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// type CategoryFilterItem = { name: string; slug: string; image?: string };

type FiltersProps = {
  categories: { name: string; slug: string; image?: string }[];
};

export default function Filters({ categories }: FiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const DEFAULT_MIN = Number(searchParams.get("minPrice")) || 25000;
  const DEFAULT_MAX = Number(searchParams.get("maxPrice")) || 200000;

  const [range, setRange] = useState([DEFAULT_MIN, DEFAULT_MAX]);
  const [isPending, startTransition] = useTransition();

  const currentCategories = searchParams.getAll("categories") || [];

  const [selected, setSelected] = useState(currentCategories);

  function handleCategoryChange(slug: string) {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];

    setSelected(next); // instant UI feedback

    const params = new URLSearchParams(searchParams.toString());
    params.delete("categories");
    next.forEach((c) => params.append("categories", c));

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function handlePriceCommit(values: number[]) {
    const [min, max] = values;
    const params = new URLSearchParams(searchParams.toString());

    params.set("minPrice", min.toString());
    params.set("maxPrice", max.toString());

    setRange(values);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleClear() {
    if (!searchParams.toString()) return;

    router.replace(pathname, { scroll: false });
    setRange([DEFAULT_MIN, DEFAULT_MAX]);
    setSelected([]);
  }

  return (
    <div className="flex flex-col gap-5 text-sm">
      <div className="flex items-center justify-between rounded-xl border-[0.5px] bg-white px-5 py-3 shadow-xs">
        <p>Filter:</p>
        <Button
          variant="link"
          className="h-auto border-0 p-0 font-normal no-underline!"
          onClick={handleClear}
        >
          Clean All
        </Button>
      </div>

      <FilterBlock title="Categories">
        <FieldSet>
          <FieldGroup>
            {categories.map((category, index) => (
              <Field key={index} orientation="horizontal">
                <Checkbox
                  id={category.slug}
                  name={category.name}
                  className="cursor-pointer"
                  checked={selected.includes(category.slug)}
                  onCheckedChange={() => handleCategoryChange(category.slug)}
                />
                <FieldLabel
                  htmlFor={category.slug}
                  className="cursor-pointer font-normal"
                >
                  {category.name}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
      </FilterBlock>

      <FilterBlock title="Price">
        <Slider
          defaultValue={range}
          // onValueChange={handlePriceChange}
          onValueCommit={handlePriceCommit}
          max={200000}
          step={1000}
          className="mx-auto mb-6 w-full max-w-xs"
        />

        <FilterRanges range={range} />
      </FilterBlock>
    </div>
  );
}
