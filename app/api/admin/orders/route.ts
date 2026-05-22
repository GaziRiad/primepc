import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getOrdersForAdminExport, getOrdersForAdminPage } from "@/lib/orders";

const toCsvValue = (value: string | number | null | undefined) => {
  const raw = value === null || value === undefined ? "" : String(value);
  return `"${raw.replace(/"/g, '""')}"`;
};

export async function GET(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "";
  const query = Object.fromEntries(searchParams.entries());

  if (format === "csv") {
    const items = await getOrdersForAdminExport(query);
    const header = [
      "order_id",
      "status",
      "created_at",
      "subtotal",
      "shipping_fee",
      "total",
      "payment_method",
      "customer_name",
      "phone",
      "email",
      "city",
      "commune",
      "items_count",
      "items",
      "notes",
    ];

    const rows = items.map((order) => {
      const orderId = String(order._id ?? "");
      const createdAt = order.createdAt
        ? new Date(order.createdAt).toISOString()
        : "";
      const customerName = `${order.customer?.firstName ?? ""} ${
        order.customer?.lastName ?? ""
      }`.trim();
      const itemsCount = (order.items ?? []).reduce(
        (sum: number, item: { quantity?: number }) =>
          sum + Number(item.quantity ?? 0),
        0,
      );
      const itemsSummary = (order.items ?? [])
        .map(
          (item: { name?: string; quantity?: number }) =>
            `${item.name ?? "Item"} x${Number(item.quantity ?? 0)}`,
        )
        .join(" | ");

      return [
        orderId,
        order.status ?? "",
        createdAt,
        Number(order.subtotal ?? 0),
        Number(order.shippingFee ?? 0),
        Number(order.total ?? 0),
        order.paymentMethod ?? "",
        customerName || "Guest",
        order.customer?.phone ?? "",
        order.customer?.email ?? "",
        order.customer?.city ?? "",
        order.customer?.commune ?? "",
        itemsCount,
        itemsSummary,
        order.notes ?? "",
      ]
        .map(toCsvValue)
        .join(",");
    });

    const csv = [header.map(toCsvValue).join(","), ...rows].join("\n");
    const filename = `orders-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"${filename}\"`,
      },
    });
  }

  const pageData = await getOrdersForAdminPage(query);
  return NextResponse.json({ ok: true, ...pageData });
}
