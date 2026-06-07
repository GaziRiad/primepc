"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Download, Search } from "lucide-react";

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
  { value: "all", label: "Tous les statuts" },
  { value: "pending_confirmation", label: "En attente de confirmation" },
  { value: "confirmed", label: "Confirmée" },
  { value: "shipped", label: "Expédiée" },
  { value: "delivered", label: "Livrée" },
  { value: "cancelled", label: "Annulée" },
  { value: "failed", label: "Échouée" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récentes d’abord" },
  { value: "oldest", label: "Plus anciennes d’abord" },
  { value: "status", label: "Statut de livraison" },
];

const ARCHIVE_OPTIONS = [
  { value: "active", label: "Commandes actives" },
  { value: "archived", label: "Archivée" },
  { value: "all", label: "Toutes les commandes" },
];

const DATE_PRESETS = [
  { label: "Aujourd’hui", days: 1 },
  { label: "7 derniers jours", days: 7 },
  { label: "30 derniers jours", days: 30 },
  { label: "90 derniers jours", days: 90 },
];

type OrdersToolbarProps = {
  initialStatus?: string;
  initialArchived?: string;
  initialFrom?: string;
  initialSearch?: string;
  initialTo?: string;
  initialSort?: string;
};

export default function OrdersToolbar({
  initialStatus = "all",
  initialArchived = "active",
  initialFrom = "",
  initialSearch = "",
  initialTo = "",
  initialSort = "newest",
}: OrdersToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [status, setStatus] = useState(initialStatus || "all");
  const [archived, setArchived] = useState(initialArchived || "active");
  const [fromDate, setFromDate] = useState(initialFrom || "");
  const [search, setSearch] = useState(initialSearch || "");
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
    q?: string;
    to?: string;
    sort?: string;
  }) => {
    const params = new URLSearchParams();
    const nextStatus = next?.status ?? status;
    const nextArchived = next?.archived ?? archived;
    const nextFrom = next?.from ?? fromDate;
    const nextSearch = next?.q ?? search;
    const nextTo = next?.to ?? toDate;
    const nextSort = next?.sort ?? sort;

    if (nextSearch.trim()) params.set("q", nextSearch.trim());
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
    setSearch("");
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
  if (search.trim()) exportParams.set("q", search.trim());
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
        <div className="space-y-2">
          <label className="text-muted-foreground text-xs font-semibold uppercase">
            Rechercher des commandes
          </label>
          <div className="relative">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Commande, client, téléphone, e-mail, adresse, produit..."
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-[200px_200px_220px_220px_200px]">
          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold uppercase">
              Statut
            </label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                applyFilters({ status: value });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Statut" />
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
              Visibilité
            </label>
            <Select
              value={archived}
              onValueChange={(value) => {
                setArchived(value);
                applyFilters({ archived: value });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Visibilité" />
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
              Date de début
            </label>
            <Input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold uppercase">
              Date de fin
            </label>
            <Input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-semibold uppercase">
              Tri
            </label>
            <Select
              value={sort}
              onValueChange={(value) => {
                setSort(value);
                applyFilters({ sort: value });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Tri" />
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
            Périodes rapides
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
          Appliquer les filtres
        </Button>
        <Button type="button" variant="ghost" onClick={handleClear}>
          Effacer
        </Button>
        <Button asChild variant="outline" className="gap-1.5">
          <a href={exportUrl} download>
            <Download className="size-4" />
            Exporter en CSV
          </a>
        </Button>
      </div>
    </form>
  );
}
