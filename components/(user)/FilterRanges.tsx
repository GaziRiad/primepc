import { formatDZD } from "@/lib/utils";

export default function FilterRanges({ range }: { range: number[] }) {
  const min = range[0];
  const max = range[1];

  return (
    <div className="flex items-center justify-between">
      <div className="text-accent-300 flex items-center border">
        <span className="flex items-center justify-center border-r p-1.5 text-xs">
          DA
        </span>
        <span className="text-accent p-1.5">{formatDZD(min)}</span>
      </div>
      <div className="text-accent-300 flex items-center border">
        <span className="flex items-center justify-center border-r p-1.5 text-xs">
          DA
        </span>
        <span className="text-accent p-1.5">{formatDZD(max)}</span>
      </div>
    </div>
  );
}
