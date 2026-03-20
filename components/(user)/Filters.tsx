"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldSet } from "../ui/field";
import { Slider } from "../ui/slider";
import FilterBlock from "./FilterBlock";
import FilterRanges from "./FilterRanges";

const Categories = [
  "Studies",
  "Gaming",
  "Design & Creativity",
  "Work",
  "Accessories",
];

export default function Filters() {
  const [range, setRange] = useState([25000, 50000]);

  return (
    <div className="flex flex-col gap-5 text-sm">
      <div className="flex items-center justify-between rounded-xl border-[0.5px] bg-white px-5 py-3 shadow-xs">
        <p>Filter:</p>
        <Button
          variant="link"
          className="h-auto border-0 p-0 font-normal no-underline!"
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
                  //   defaultChecked
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
          onValueChange={setRange}
          max={200000}
          step={1000}
          className="mx-auto mb-6 w-full max-w-xs"
        />

        <FilterRanges range={range} />
      </FilterBlock>
    </div>
  );
}
