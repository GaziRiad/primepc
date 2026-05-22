import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "default" | "success" | "warning" | "danger";
};

const toneStyles: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  default: "bg-white",
  success: "bg-emerald-50",
  warning: "bg-amber-50",
  danger: "bg-rose-50",
};

export default function AdminStatCard({
  label,
  value,
  helper,
  tone = "default",
}: AdminStatCardProps) {
  return (
    <div className={cn("rounded-2xl border p-5 shadow-xs", toneStyles[tone])}>
      <p className="text-muted-foreground text-xs tracking-wide uppercase">
        {label}
      </p>
      <p className="text-foreground mt-2 text-2xl font-semibold">{value}</p>
      {helper && <p className="text-muted-foreground mt-2 text-xs">{helper}</p>}
    </div>
  );
}
