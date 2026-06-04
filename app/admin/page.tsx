import Link from "next/link";

import startDbConnection from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
import AdminOverviewCharts from "@/components/admin/AdminOverviewCharts";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDZD } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending_confirmation: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  failed: "bg-slate-200 text-slate-700",
};

const STATUS_ORDER = [
  "pending_confirmation",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
];

const TREND_DAYS = 30;
const TREND_BUCKETS = 5;

const formatRangeDate = (date: Date) =>
  date.toLocaleDateString("en", { day: "numeric", month: "short" });

export default async function page() {
  await startDbConnection();

  const trendStart = new Date();
  trendStart.setDate(trendStart.getDate() - (TREND_DAYS - 1));
  trendStart.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    inStock,
    outOfStock,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    revenueAgg,
    orderTrendAgg,
    statusAgg,
    recentOrders,
  ] = await Promise.all([
    Product.countDocuments({}),
    Product.countDocuments({ stock: { $gt: 0 } }),
    Product.countDocuments({ stock: { $lte: 0 } }),
    Order.countDocuments({}),
    Order.countDocuments({ status: "pending_confirmation" }),
    Order.countDocuments({ status: "delivered" }),
    Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: trendStart } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: "Africa/Algiers",
            },
          },
          orders: { $sum: 1 },
          deliveredOrders: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, 1, 0],
            },
          },
          orderValue: { $sum: "$total" },
          revenue: {
            $sum: {
              $cond: [{ $eq: ["$status", "delivered"] }, "$total", 0],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: "$status", value: { $sum: 1 } } }]),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select("total status createdAt customer")
      .lean(),
  ]);

  const totalRevenue = revenueAgg?.[0]?.total ?? 0;
  const trendMap = new Map(
    orderTrendAgg.map((point) => [
      String(point._id),
      {
        orders: Number(point.orders ?? 0),
        deliveredOrders: Number(point.deliveredOrders ?? 0),
        orderValue: Number(point.orderValue ?? 0),
        revenue: Number(point.revenue ?? 0),
      },
    ]),
  );

  const dailyTrend = Array.from({ length: TREND_DAYS }, (_, index) => {
    const date = new Date(trendStart);
    date.setDate(trendStart.getDate() + index);

    const key = date.toISOString().slice(0, 10);
    const point = trendMap.get(key);

    return {
      date,
      orders: point?.orders ?? 0,
      deliveredOrders: point?.deliveredOrders ?? 0,
      orderValue: point?.orderValue ?? 0,
      revenue: point?.revenue ?? 0,
    };
  });
  const bucketSize = Math.ceil(TREND_DAYS / TREND_BUCKETS);
  const orderTrend = Array.from({ length: TREND_BUCKETS }, (_, index) => {
    const bucket = dailyTrend.slice(
      index * bucketSize,
      (index + 1) * bucketSize,
    );
    const firstDay = bucket[0]?.date ?? trendStart;
    const lastDay = bucket[bucket.length - 1]?.date ?? firstDay;

    return {
      label: `${formatRangeDate(firstDay)} - ${formatRangeDate(lastDay)}`,
      orders: bucket.reduce((sum, point) => sum + point.orders, 0),
      deliveredOrders: bucket.reduce(
        (sum, point) => sum + point.deliveredOrders,
        0,
      ),
      orderValue: bucket.reduce((sum, point) => sum + point.orderValue, 0),
      revenue: bucket.reduce((sum, point) => sum + point.revenue, 0),
    };
  });
  const periodOrderValue = orderTrend.reduce(
    (sum, point) => sum + point.orderValue,
    0,
  );
  const periodRevenue = orderTrend.reduce(
    (sum, point) => sum + point.revenue,
    0,
  );
  const periodOrders = orderTrend.reduce((sum, point) => sum + point.orders, 0);
  const bestPeriod = orderTrend.reduce(
    (best, point) => (point.revenue > best.revenue ? point : best),
    orderTrend[0],
  );
  const salesSummary = {
    averageOrderValue:
      periodOrders > 0 ? Math.round(periodOrderValue / periodOrders) : 0,
    bestPeriodLabel: bestPeriod?.label ?? "-",
    bestPeriodRevenue: bestPeriod?.revenue ?? 0,
    orderValue: periodOrderValue,
    orders: periodOrders,
    revenue: periodRevenue,
  };
  const statusMap = new Map(
    statusAgg.map((status) => [String(status._id), Number(status.value ?? 0)]),
  );
  const orderStatuses = STATUS_ORDER.map((status) => ({
    label: status,
    value: statusMap.get(status) ?? 0,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          label="Total products"
          value={totalProducts}
          tone="brand"
        />
        <AdminStatCard label="In stock" value={inStock} tone="inventory" />
        <AdminStatCard
          label="Out of stock"
          value={outOfStock}
          tone="attention"
        />
        <AdminStatCard
          label="Total orders"
          value={totalOrders}
          helper={`${pendingOrders} awaiting confirmation`}
          tone="orders"
        />
      </div>

      <AdminOverviewCharts
        salesSummary={salesSummary}
        statuses={orderStatuses}
        trend={orderTrend}
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border bg-white shadow-xs">
          <div className="flex flex-col gap-2 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-foreground text-lg font-semibold">
                Recent orders
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Latest orders that need attention.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-primary text-sm font-semibold"
            >
              View all
            </Link>
          </div>

          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Placed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No orders yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => {
                  const orderId = String(order._id ?? "");
                  const label = orderId ? `#${orderId.slice(-6)}` : "-";
                  const name = `${order.customer?.firstName ?? ""} ${
                    order.customer?.lastName ?? ""
                  }`.trim();
                  const placedDate = new Date(
                    order.createdAt,
                  ).toLocaleDateString();

                  return (
                    <TableRow key={orderId}>
                      <TableCell className="text-foreground font-medium whitespace-normal">
                        <div className="flex flex-col gap-1">
                          <span>{label}</span>
                          <span className="text-muted-foreground text-xs md:hidden">
                            {`${name || "Guest"} - ${placedDate}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {name || "Guest"}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatDZD(order.total ?? 0)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            STATUS_STYLES[order.status] ??
                            "bg-muted text-foreground"
                          }
                        >
                          {order.status?.replace(/_/g, " ") ?? "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden text-xs md:table-cell">
                        {placedDate}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-xs sm:p-6">
          <h2 className="text-foreground text-lg font-semibold">
            Revenue snapshot
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Delivered orders revenue to date.
          </p>

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <p className="text-muted-foreground text-xs uppercase">
                Delivered revenue
              </p>
              <p className="text-foreground mt-2 text-2xl font-semibold">
                {formatDZD(totalRevenue)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase">
                Delivered orders
              </p>
              <p className="text-foreground mt-2 text-2xl font-semibold">
                {deliveredOrders}
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-foreground hover:bg-accent-100 w-full rounded-full border px-4 py-2 text-center text-sm font-semibold transition sm:w-auto"
            >
              Manage products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
