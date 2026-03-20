import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortOptions = [
  { value: "priceHighToLow", label: "Price: High to Low" },
  { value: "priceLowToHigh", label: "Price: Low to High" },
];

export default function SorterFilter() {
  return (
    <Select>
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
