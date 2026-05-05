"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDZD } from "@/lib/utils";

const STATUS_OPTIONS = [
  "pending_confirmation",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
] as const;

type OrderStatus = (typeof STATUS_OPTIONS)[number];

type OrderRow = {
  _id: string;
  subtotal?: number;
  shippingFee?: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  customer?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    street?: string;
    apartment?: string;
    city?: string;
    commune?: string;
    country?: string;
  };
  items?: Array<{
    name?: string;
    quantity?: number;
    unitPrice?: number;
    finalPrice?: number;
    coverImage?: string;
  }>;
  statusHistory?: Array<{
    status?: string;
    note?: string;
    changedAt?: string;
  }>;
  paymentMethod?: string;
  notes?: string;
  user?: { name?: string; email?: string } | null;
};

type OrdersTableProps = {
  orders: OrderRow[];
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending_confirmation: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  failed: "bg-slate-200 text-slate-700",
};

export default function OrdersTable({ orders }: OrdersTableProps) {
  const normalizeOrderId = (value: unknown) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const oid = (value as { $oid?: string }).$oid;
      if (typeof oid === "string") return oid;
      const id = (value as { id?: string }).id;
      if (typeof id === "string") return id;
      const nested = (value as { _id?: unknown })._id;
      if (typeof nested === "string") return nested;
      if (typeof nested === "object" && nested) {
        const nestedOid = (nested as { $oid?: string }).$oid;
        if (typeof nestedOid === "string") return nestedOid;
      }
      if (
        typeof (value as { toString?: () => string }).toString === "function"
      ) {
        return (value as { toString: () => string }).toString();
      }
    }
    const stringified = String(value);
    const match = stringified.match(/[a-f0-9]{24}/i);
    return match ? match[0] : stringified;
  };

  const [rows, setRows] = useState<OrderRow[]>(() =>
    orders.map((order) => ({
      ...order,
      _id: normalizeOrderId(order._id),
    })),
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<OrderRow | null>(null);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    if (!orderId) {
      toast.error("Invalid order id.");
      return;
    }
    setUpdatingId(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        order?: OrderRow;
        error?: string;
      };

      if (!response.ok || !data?.ok || !data.order) {
        if (response.status === 403) {
          toast.error("You are not authorized to update orders.");
        } else {
          toast.error(data?.error || "Unable to update order status.");
        }
        return;
      }

      setRows((current) =>
        current.map((order) =>
          order._id === orderId
            ? {
                ...order,
                status: data.order?.status ?? status,
                statusHistory: data.order?.statusHistory ?? order.statusHistory,
              }
            : order,
        ),
      );

      if (activeOrder?._id === orderId) {
        setActiveOrder({
          ...activeOrder,
          status: data.order?.status ?? status,
          statusHistory: data.order?.statusHistory ?? activeOrder.statusHistory,
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const closeModal = () => setActiveOrder(null);

  return (
    <div className="rounded-2xl border bg-white shadow-xs">
      <div className="border-b px-6 py-4">
        <h2 className="text-foreground text-lg font-semibold">Orders</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage incoming COD orders and update fulfillment status.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-180 text-sm">
          <thead className="bg-muted/30 text-muted-foreground">
            <tr className="text-left">
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">Customer</th>
              <th className="px-6 py-3 font-medium">Total</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Placed</th>
              <th className="px-6 py-3 font-medium">Update</th>
              <th className="px-6 py-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="text-muted-foreground px-6 py-6" colSpan={7}>
                  No orders yet.
                </td>
              </tr>
            ) : (
              rows.map((order) => {
                const orderId = normalizeOrderId(order._id);
                const name = `${order.customer?.firstName ?? ""} ${
                  order.customer?.lastName ?? ""
                }`.trim();
                const location = [order.customer?.city, order.customer?.commune]
                  .filter(Boolean)
                  .join(", ");
                const itemsCount = (order.items ?? []).reduce(
                  (sum, item) => sum + (item.quantity ?? 0),
                  0,
                );

                return (
                  <tr key={orderId || order._id} className="border-t">
                    <td className="px-6 py-4">
                      <div className="text-foreground font-medium">
                        #{orderId.slice(-6)}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {itemsCount} item{itemsCount === 1 ? "" : "s"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground font-medium">
                        {name || "Guest"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {order.customer?.phone ?? ""}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {location}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatDZD(order.total ?? 0)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          STATUS_STYLES[order.status] ??
                          "bg-muted text-foreground"
                        }
                      >
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground px-6 py-4 text-xs">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className="h-8 rounded-lg border px-2 text-xs"
                        value={order.status}
                        onChange={(event) =>
                          updateStatus(
                            orderId,
                            event.target.value as OrderStatus,
                          )
                        }
                        disabled={updatingId === orderId}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        type="button"
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          setActiveOrder({ ...order, _id: orderId })
                        }
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {activeOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b px-6 py-4">
              <div>
                <h3 className="text-foreground text-lg font-semibold">
                  Order #{activeOrder._id.slice(-6)}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {new Date(activeOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close order details"
                className="text-muted-foreground hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-full border"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid max-h-[calc(90vh-64px)] gap-6 overflow-y-auto px-6 py-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="flex flex-col gap-5">
                <div>
                  <h4 className="text-foreground text-sm font-semibold">
                    Items
                  </h4>
                  <div className="mt-3 space-y-3">
                    {(activeOrder.items ?? []).map((item, index) => {
                      const qty = Number(item.quantity ?? 0);
                      const price =
                        Number(item.finalPrice ?? item.unitPrice ?? 0) * qty;

                      return (
                        <div
                          key={`${item.name ?? "item"}-${index}`}
                          className="flex items-center gap-3 rounded-xl border px-3 py-2"
                        >
                          <div className="relative size-12 overflow-hidden rounded-lg bg-zinc-100">
                            {item.coverImage && (
                              <Image
                                fill
                                src={item.coverImage}
                                alt={item.name ?? "Order item"}
                                className="object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-foreground text-sm font-medium">
                              {item.name ?? "Item"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Qty {qty}
                            </p>
                          </div>
                          <div className="text-sm font-semibold">
                            {formatDZD(price)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="text-foreground text-sm font-semibold">
                    Status history
                  </h4>
                  <div className="text-muted-foreground mt-3 space-y-2 text-xs">
                    {(activeOrder.statusHistory ?? []).length === 0
                      ? "No updates yet."
                      : activeOrder.statusHistory?.map((entry, index) => (
                          <div key={`${entry.status}-${index}`}>
                            <span className="text-foreground font-medium">
                              {entry.status?.replace(/_/g, " ")}
                            </span>
                            {entry.changedAt
                              ? ` • ${new Date(entry.changedAt).toLocaleString()}`
                              : ""}
                            {entry.note ? ` • ${entry.note}` : ""}
                          </div>
                        ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="rounded-xl border px-4 py-3">
                  <h4 className="text-foreground text-sm font-semibold">
                    Customer
                  </h4>
                  <p className="text-foreground mt-2 text-sm font-medium">
                    {`${activeOrder.customer?.firstName ?? ""} ${
                      activeOrder.customer?.lastName ?? ""
                    }`.trim() || "Guest"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {activeOrder.customer?.phone ?? ""}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {activeOrder.customer?.email ?? ""}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {activeOrder.customer?.street ?? ""}
                    {activeOrder.customer?.apartment
                      ? `, ${activeOrder.customer.apartment}`
                      : ""}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {[
                      activeOrder.customer?.city,
                      activeOrder.customer?.commune,
                      activeOrder.customer?.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>

                <div className="rounded-xl border px-4 py-3">
                  <h4 className="text-foreground text-sm font-semibold">
                    Summary
                  </h4>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="font-semibold">
                      {formatDZD(activeOrder.subtotal ?? 0)}
                    </span>
                  </div>
                  <div className="text-muted-foreground mt-2 flex items-center justify-between text-sm">
                    <span>Shipping</span>
                    <span>{formatDZD(activeOrder.shippingFee ?? 0)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                    <span className="font-semibold">Total</span>
                    <span className="text-primary-700 font-semibold">
                      {formatDZD(activeOrder.total ?? 0)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border px-4 py-3">
                  <h4 className="text-foreground text-sm font-semibold">
                    Status
                  </h4>
                  <Badge
                    className={
                      STATUS_STYLES[activeOrder.status] ??
                      "bg-muted text-foreground"
                    }
                  >
                    {activeOrder.status.replace(/_/g, " ")}
                  </Badge>
                  <p className="text-muted-foreground mt-2 text-xs">
                    Payment: {activeOrder.paymentMethod ?? "cod"}
                  </p>
                  {activeOrder.notes && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      Notes: {activeOrder.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
