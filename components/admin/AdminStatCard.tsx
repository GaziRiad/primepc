import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "default" | "brand" | "inventory" | "attention" | "orders";
};

const toneStyles: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "border-slate-200 bg-white",
  brand: "border-primary-100 bg-white shadow-[inset_0_3px_0_var(--primary)]",
  inventory:
    "border-cyan-100 bg-linear-to-br from-white to-cyan-50 shadow-[inset_0_3px_0_#06b6d4]",
  attention:
    "border-rose-100 bg-linear-to-br from-white to-rose-50 shadow-[inset_0_3px_0_#e11d48]",
  orders:
    "border-indigo-100 bg-linear-to-br from-white to-indigo-50 shadow-[inset_0_3px_0_#4f46e5]",
};

export default function AdminStatCard({
  label,
  value,
  helper,
  tone = "default",
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-sm",
        toneStyles[tone],
      )}
    >
      <p className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </p>
      <p className="text-foreground mt-2 text-2xl font-semibold">{value}</p>
      {helper && <p className="text-muted-foreground mt-2 text-xs">{helper}</p>}
    </div>
  );
}
