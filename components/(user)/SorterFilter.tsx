"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const sortOptions = [
  { value: "-finalPrice", label: "Price: High to Low" },
  { value: "finalPrice", label: "Price: Low to High" },
];

export default function SorterFilter() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "";

  function handleSorting(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    params.set("sort", value);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Select value={currentSort} onValueChange={handleSorting}>
      <SelectTrigger size="sm" className="w-full max-w-48">
        <SelectValue placeholder="Sort By:" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {/* <SelectLabel>Sort By:</SelectLabel> */}
          {sortOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="hover:text-accent-foreground cursor-pointer"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
