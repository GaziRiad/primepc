import { NextResponse } from "next/server";

import startDbConnection from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  buildOrderItems,
  SHIPPING_FEE,
  SHIPPING_THRESHOLD,
  type CustomerDetails,
  type OrderItemInput,
} from "@/lib/orders";
import {
  sendAdminOrderNotification,
  sendCustomerOrderConfirmation,
} from "@/lib/notifications";
import Cart from "@/models/Cart";
import Order from "@/models/Order";
import Product from "@/models/Product";

const REQUIRED_FIELDS: Array<keyof CustomerDetails> = [
  "firstName",
  "lastName",
  "phone",
  "email",
  "street",
  "city",
  "commune",
];

type CreateOrderBody = {
  customer?: CustomerDetails;
  items?: OrderItemInput[];
  notes?: string;
};

const validateCustomer = (customer?: CustomerDetails) => {
  if (!customer) return false;

  return REQUIRED_FIELDS.every((field) => {
    const value = String(customer[field] ?? "").trim();
    return value.length > 0;
  });
};

export async function POST(request: Request) {
  try {
    await startDbConnection();
    const session = await auth();

    let body: CreateOrderBody;
    try {
      body = (await request.json()) as CreateOrderBody;
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_payload" },
        { status: 400 },
      );
    }

    if (!validateCustomer(body.customer)) {
      return NextResponse.json(
        { ok: false, error: "missing_customer_details" },
        { status: 400 },
      );
    }

    let items: OrderItemInput[] = [];

    if (session?.user?.id) {
      const cart = await Cart.findOne({ user: session.user.id })
        .select("items")
        .lean();

      const cartItems = Array.isArray(cart?.items) ? cart.items : [];

      items = cartItems.map(
        (item: { product?: unknown; quantity?: unknown }) => ({
          productId: String(item.product ?? ""),
          quantity: Number(item.quantity ?? 0),
        }),
      );
    } else {
      items = Array.isArray(body.items) ? body.items : [];
    }

    if (items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "empty_cart" },
        { status: 400 },
      );
    }

    const build = await buildOrderItems(items);

    if (!build.ok) {
      return NextResponse.json(
        { ok: false, error: "invalid_items", issues: build.issues },
        { status: 409 },
      );
    }

    const shippingFee =
      build.subtotal >= SHIPPING_THRESHOLD
        ? 0
        : build.subtotal > 0
          ? SHIPPING_FEE
          : 0;

    const total = build.subtotal + shippingFee;

    const order = await Order.create({
      user: session?.user?.id ?? undefined,
      customer: {
        ...body.customer,
        apartment: body.customer?.apartment ?? "",
        country: body.customer?.country ?? "Algeria",
      },
      items: build.items,
      subtotal: build.subtotal,
      shippingFee,
      total,
      status: "pending_confirmation",
      statusHistory: [
        {
          status: "pending_confirmation",
          note: "Order placed",
          changedAt: new Date(),
          changedBy: session?.user?.id ?? null,
        },
      ],
      paymentMethod: "cod",
      source: session?.user?.id ? "user" : "guest",
      notes: body.notes ?? "",
    });

    await Product.bulkWrite(
      build.items.map((item) => ({
        updateOne: {
          filter: { _id: item.product, stock: { $gte: item.quantity } },
          update: { $inc: { stock: -item.quantity } },
        },
      })),
    );

    if (session?.user?.id) {
      await Cart.findOneAndUpdate(
        { user: session.user.id },
        { $set: { items: [] } },
      );
    }

    const emailPayload = {
      orderId: String(order._id),
      items: build.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        finalPrice: item.finalPrice,
      })),
      subtotal: build.subtotal,
      shippingFee,
      total,
      customer: {
        name: `${body.customer?.firstName} ${body.customer?.lastName}`.trim(),
        email: body.customer?.email ?? "",
        phone: body.customer?.phone ?? "",
        street: body.customer?.street ?? "",
        apartment: body.customer?.apartment ?? "",
        city: body.customer?.city ?? "",
        commune: body.customer?.commune ?? "",
        country: body.customer?.country ?? "Algeria",
      },
      notes: body.notes ?? "",
      createdAt: order.createdAt,
    };

    await Promise.allSettled([
      sendAdminOrderNotification(emailPayload),
      sendCustomerOrderConfirmation(emailPayload),
    ]);

    return NextResponse.json({ ok: true, orderId: String(order._id) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create order";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
