import { formatDZD } from "@/lib/utils";
import { getOrderStatusLabel } from "@/lib/orderStatus";

type TrendPoint = {
  label: string;
  orders: number;
  deliveredOrders: number;
  orderValue: number;
  revenue: number;
};

type StatusPoint = {
  label: string;
  value: number;
};

type SalesSummary = {
  averageOrderValue: number;
  bestPeriodLabel: string;
  bestPeriodRevenue: number;
  orderValue: number;
  orders: number;
  revenue: number;
};

type AdminOverviewChartsProps = {
  salesSummary: SalesSummary;
  statuses: StatusPoint[];
  trend: TrendPoint[];
};

const statusStyles: Record<string, string> = {
  pending_confirmation: "bg-amber-500",
  confirmed: "bg-blue-500",
  shipped: "bg-indigo-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-rose-500",
  failed: "bg-slate-500",
};

export default function AdminOverviewCharts({
  salesSummary,
  statuses,
  trend,
}: AdminOverviewChartsProps) {
  const maxOrderValue = Math.max(...trend.map((point) => point.orderValue), 1);
  const totalStatusCount = Math.max(
    statuses.reduce((sum, status) => sum + status.value, 0),
    1,
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
      <section className="rounded-2xl border bg-white p-4 shadow-xs sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Aperçu des ventes sur 30 jours
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Valeur des commandes, chiffre d’affaires livré et volume regroupés
              par période.
            </p>
          </div>
          <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            30 derniers jours
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="text-muted-foreground text-xs uppercase">
              Valeur des commandes
            </p>
            <p className="text-foreground mt-1 text-lg font-semibold">
              {formatDZD(salesSummary.orderValue)}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-muted-foreground text-xs uppercase">
              Chiffre d’affaires livré
            </p>
            <p className="text-foreground mt-1 text-lg font-semibold">
              {formatDZD(salesSummary.revenue)}
            </p>
          </div>
          <div className="border-primary-100 bg-primary-50 rounded-xl border p-3">
            <p className="text-muted-foreground text-xs uppercase">
              Commandes passées
            </p>
            <p className="text-foreground mt-1 text-lg font-semibold">
              {salesSummary.orders}
            </p>
          </div>
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3">
            <p className="text-muted-foreground text-xs uppercase">
              Panier moyen
            </p>
            <p className="text-foreground mt-1 text-lg font-semibold">
              {formatDZD(salesSummary.averageOrderValue)}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {trend.map((point) => {
            const orderWidth = Math.max(
              point.orderValue > 0 ? 6 : 0,
              Math.round((point.orderValue / maxOrderValue) * 100),
            );
            const revenueWidth = Math.min(
              orderWidth,
              Math.round((point.revenue / maxOrderValue) * 100),
            );

            return (
              <div
                key={point.label}
                className="grid gap-2 sm:grid-cols-[8rem_1fr]"
              >
                <div>
                  <p className="text-foreground text-sm font-semibold">
                    {point.label}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {point.orders} commande{point.orders === 1 ? "" : "s"} -{" "}
                    {point.deliveredOrders} livrée
                    {point.deliveredOrders === 1 ? "" : "s"}
                  </p>
                </div>

                <div className="min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold">
                      {formatDZD(point.orderValue)}
                    </span>
                    <span className="text-muted-foreground">
                      Livrée {formatDZD(point.revenue)}
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-primary-500 h-full rounded-full"
                      style={{ width: `${orderWidth}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
                      style={{ width: `${revenueWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-4 text-xs text-slate-600">
          <span className="flex items-center gap-2">
            <span className="bg-primary-500 size-2.5 rounded-full" />
            Valeur des commandes
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500" />
            Chiffre d’affaires livré
          </span>
          <span>
            Meilleure période :{" "}
            <strong className="text-foreground">
              {salesSummary.bestPeriodLabel} -{" "}
              {formatDZD(salesSummary.bestPeriodRevenue)}
            </strong>
          </span>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-4 shadow-xs sm:p-6">
        <h2 className="text-foreground text-lg font-semibold">
          Répartition des statuts
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Visualisez les commandes en attente, en cours et terminées.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {statuses.map((status) => {
            const percentage = Math.round(
              (status.value / totalStatusCount) * 100,
            );
            const width = Math.max(status.value > 0 ? 4 : 0, percentage);

            return (
              <div key={status.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-foreground capitalize">
                    {getOrderStatusLabel(status.label)}
                  </span>
                  <span className="font-semibold">
                    {status.value} - {percentage}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${
                      statusStyles[status.label] ?? "bg-slate-400"
                    }`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
