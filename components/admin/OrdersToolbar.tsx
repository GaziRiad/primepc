"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "pending_confirmation", label: "Pending confirmation" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "failed", label: "Failed" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "status", label: "Delivery status" },
];

const ARCHIVE_OPTIONS = [
  { value: "active", label: "Active orders" },
  { value: "archived", label: "Archived" },
  { value: "all", label: "All orders" },
];

const DATE_PRESETS = [
  { label: "Today", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

type OrdersToolbarProps = {
  initialStatus?: string;
  initialArchived?: string;
  initialFrom?: string;
  initialTo?: string;
  initialSort?: string;
};

export default function OrdersToolbar({
  initialStatus = "all",
  initialArchived = "active",
  initialFrom = "",
  initialTo = "",
  initialSort = "newest",
}: OrdersToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [status, setStatus] = useState(initialStatus || "all");
  const [archived, setArchived] = useState(initialArchived || "active");
  const [fromDate, setFromDate] = useState(initialFrom || "");
  const [toDate, setToDate] = useState(initialTo || "");
  const [sort, setSort] = useState(initialSort || "newest");

  const toInputDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const applyFilters = (next?: {
    status?: string;
    archived?: string;
    from?: string;
    to?: string;
    sort?: string;
  }) => {
    const params = new URLSearchParams();
    const nextStatus = next?.status ?? status;
    const nextArchived = next?.archived ?? archived;
    const nextFrom = next?.from ?? fromDate;
    const nextTo = next?.to ?? toDate;
    const nextSort = next?.sort ?? sort;

    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    if (nextArchived && nextArchived !== "active") {
      params.set("archived", nextArchived);
    }
    if (nextFrom) params.set("from", nextFrom);
    if (nextTo) params.set("to", nextTo);
    if (nextSort && nextSort !== "newest") params.set("sort", nextSort);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    applyFilters();
  };

  const handleClear = () => {
    setStatus("all");
    setArchived("active");
    setFromDate("");
    setToDate("");
    setSort("newest");
    router.replace(pathname, { scroll: false });
  };

  const applyPresetDays = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - (days - 1));

    const fromValue = toInputDate(from);
    const toValue = toInputDate(to);
    setFromDate(fromValue);
    setToDate(toValue);
    applyFilters({ from: fromValue, to: toValue });
  };

  const exportParams = new URLSearchParams();
  if (status && status !== "all") exportParams.set("status", status);
  if (archived && archived !== "active") {
    exportParams.set("archived", archived);
  }
  if (fromDate) exportParams.set("from", fromDate);
  if (toDate) exportParams.set("to", toDate);
  if (sort && sort !== "newest") exportParams.set("sort", sort);
  exportParams.set("format", "csv");
  const exportUrl = `/api/admin/orders?${exportParams.toString()}`;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-xs lg:flex-row lg:flex-wrap lg:items-end lg:justify-between"
    >
      <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-1">
        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-[200px_200px_220px_220px_200px]">
          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold uppercase">
              Status
            </label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                applyFilters({ status: value });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold uppercase">
              Visibility
            </label>
            <Select
              value={archived}
              onValueChange={(value) => {
                setArchived(value);
                applyFilters({ archived: value });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent>
                {ARCHIVE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold uppercase">
              From date
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold uppercase">
              To date
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold uppercase">
              Sort
            </label>
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value);
                applyFilters({ sort: value });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs font-semibold uppercase">
            Quick ranges
          </span>
          {DATE_PRESETS.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => applyPresetDays(preset.days)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
        <Button type="submit" variant="outline">
          Apply filters
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear}>
          Clear
        </Button>
        <Button asChild variant="outline" className="gap-1.5">
          <a href={exportUrl} download>
            <Download className="size-4" />
            Export CSV
          </a>
        </Button>
      </div>
    </form>
  );
}
