import Link from "next/link";

import startDbConnection from "@/lib/db";
import Product from "@/models/Product";
import Order from "@/models/Order";
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

export default async function page() {
  await startDbConnection();

  const [
    totalProducts,
    inStock,
    outOfStock,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    revenueAgg,
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
    Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select("total status createdAt customer")
      .lean(),
  ]);

  const totalRevenue = revenueAgg?.[0]?.total ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total products" value={totalProducts} />
        <AdminStatCard label="In stock" value={inStock} tone="success" />
        <AdminStatCard label="Out of stock" value={outOfStock} tone="warning" />
        <AdminStatCard
          label="Total orders"
          value={totalOrders}
          helper={`${pendingOrders} awaiting confirmation`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border bg-white shadow-xs">
          <div className="flex items-center justify-between border-b px-6 py-4">
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
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Placed</TableHead>
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

                  return (
                    <TableRow key={orderId}>
                      <TableCell className="text-foreground font-medium">
                        {label}
                      </TableCell>
                      <TableCell>{name || "Guest"}</TableCell>
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
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-xs">
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
              className="text-foreground hover:bg-accent-100 rounded-full border px-4 py-2 text-center text-sm font-semibold transition"
            >
              Manage products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
