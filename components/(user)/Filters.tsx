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

const DEFAULT_MIN = 25000;
const DEFAULT_MAX = 200000;

export default function Filters({ categories }: FiltersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlMin = Number(searchParams.get("minPrice")) || DEFAULT_MIN;
  const urlMax = Number(searchParams.get("maxPrice")) || DEFAULT_MAX;
  const sliderKey = `${urlMin}-${urlMax}`;

  const currentCategories = searchParams.getAll("categories") || [];

  const [range, setRange] = useState([urlMin, urlMax]);
  const [, startTransition] = useTransition();

  // optimistic state
  const [selected, setSelected] = useState(currentCategories);

  function handleCategoryChange(slug: string) {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];

    setSelected(next); // instant UI feedback

    const params = new URLSearchParams(searchParams.toString());
    params.delete("categories");
    params.delete("page");
    next.forEach((c) => params.append("categories", c));

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function handlePriceCommit(values: number[]) {
    const [min, max] = values;
    const params = new URLSearchParams(searchParams.toString());

    setRange(values);
    params.set("minPrice", min.toString());
    params.set("maxPrice", max.toString());
    params.delete("page");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }
  function handleClear() {
    if (!searchParams.toString()) return;

    setSelected([]);
    setRange([DEFAULT_MIN, DEFAULT_MAX]);

    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
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
          key={sliderKey}
          defaultValue={[urlMin, urlMax]}
          onValueCommit={handlePriceCommit}
          onValueChange={setRange}
          max={200000}
          step={1000}
          className="mx-auto mb-6 w-full max-w-full sm:max-w-xs"
        />

        <FilterRanges range={range} />
      </FilterBlock>
    </div>
  );
}
