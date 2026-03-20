"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "../ui/field";
import { Slider } from "../ui/slider";
import FilterBlock from "./FilterBlock";
import FilterRanges from "./FilterRanges";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const Categories = [
  "Studies",
  "Gaming",
  "Design-Creativity",
  "Work",
  "Accessories",
];

export default function Filters() {
  const [range, setRange] = useState([25000, 50000]);
  const maxPrice = range[1];
  const minPrice = range[1];

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategories = searchParams.getAll("category");

  function handleCategoryChange(category: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (currentCategories.includes(category)) {
      // when checked, remove the category from the query
      const updated = currentCategories.filter((cat) => cat !== category);
      params.delete("category");
      updated.forEach((cat) => params.append("category", cat));
    } else {
      // when not checked, add newly checked category
      params.append("category", category);
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handlePriceChange(values: number[]) {
    const params = new URLSearchParams(searchParams.toString());
    setRange(values);
  }

  function handleClear() {
    router.replace(pathname, { scroll: false });
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
            {Categories.map((category, index) => (
              <Field key={index} orientation="horizontal">
                <Checkbox
                  id={category}
                  name={category}
                  className="cursor-pointer"
                  checked={currentCategories.includes(category)}
                  onCheckedChange={() => handleCategoryChange(category)}
                />
                <FieldLabel
                  htmlFor={category}
                  className="cursor-pointer font-normal"
                >
                  {category}
                </FieldLabel>
              </Field>
            ))}
          </FieldGroup>
        </FieldSet>
      </FilterBlock>

      <FilterBlock title="Price">
        <Slider
          defaultValue={range}
          onValueChange={handlePriceChange}
          max={200000}
          step={1000}
          className="mx-auto mb-6 w-full max-w-xs"
        />

        <FilterRanges range={range} />
      </FilterBlock>
    </div>
  );
}
