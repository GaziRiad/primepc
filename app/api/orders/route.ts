import { NextResponse } from "next/server";

import startDbConnection from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidateProductCache } from "@/lib/cache";
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
import { recordProductAnalyticsEvents } from "@/lib/productAnalytics";
import { cancelAbandonedCartReminder } from "@/lib/cartRecovery";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";
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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MAX_NOTES_LENGTH = 1000;

type CreateOrderBody = {
  customer?: Partial<CustomerDetails>;
  items?: OrderItemInput[];
  notes?: string;
};

const normalizeText = (value: unknown, maxLength: number) =>
  String(value ?? "")
    .trim()
    .slice(0, maxLength);

const normalizeCustomer = (
  customer?: Partial<CustomerDetails>,
): CustomerDetails | null => {
  if (!customer || typeof customer !== "object") return null;

  return {
    firstName: normalizeText(customer.firstName, 80),
    lastName: normalizeText(customer.lastName, 80),
    phone: normalizeText(customer.phone, 40),
    email: normalizeText(customer.email, 120).toLowerCase(),
    street: normalizeText(customer.street, 160),
    apartment: normalizeText(customer.apartment, 120),
    city: normalizeText(customer.city, 80),
    commune: normalizeText(customer.commune, 80),
    country: normalizeText(customer.country || "Algeria", 80) || "Algeria",
  };
};

const validateCustomer = (customer?: Partial<CustomerDetails>) => {
  const normalized = normalizeCustomer(customer);
  if (!normalized) return null;

  const hasRequiredFields = REQUIRED_FIELDS.every((field) => {
    const value = normalized[field];
    return typeof value === "string" && value.length > 0;
  });
  const phoneDigits = normalized.phone.replace(/\D/g, "");

  if (!hasRequiredFields) return null;
  if (phoneDigits.length < 8) return null;
  if (!EMAIL_REGEX.test(normalized.email)) return null;

  return normalized;
};

const rollbackReservedStock = async (
  items: Array<{ product: unknown; quantity: number; variantId?: string }>,
) => {
  if (items.length === 0) return;

  for (const item of items) {
    if (item.variantId) {
      await Product.updateOne(
        { _id: item.product, "variants._id": item.variantId },
        {
          $inc: {
            stock: item.quantity,
            "variants.$.stock": item.quantity,
          },
        },
      );
    } else {
      await Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } },
      );
    }
  }
};

const reserveStock = async (
  items: Array<{ product: unknown; quantity: number; variantId?: string }>,
) => {
  const reserved: Array<{
    product: unknown;
    quantity: number;
    variantId?: string;
  }> = [];

  for (const item of items) {
    const result = item.variantId
      ? await Product.updateOne(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
            variants: {
              $elemMatch: {
                _id: item.variantId,
                active: { $ne: false },
                stock: { $gte: item.quantity },
              },
            },
          },
          {
            $inc: {
              stock: -item.quantity,
              "variants.$.stock": -item.quantity,
            },
          },
        )
      : await Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        );

    if (result.modifiedCount !== 1) {
      await rollbackReservedStock(reserved);
      return false;
    }

    reserved.push(item);
  }

  return true;
};

export async function POST(request: Request) {
  try {
    const ipLimit = await consumeRateLimit(request, {
      limit: 10,
      scope: "orders:create:ip",
      windowMs: 60 * 60 * 1000,
    });

    if (!ipLimit.allowed) {
      return rateLimitResponse(
        ipLimit,
        "Trop de tentatives de commande. Veuillez reessayer plus tard.",
      );
    }

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

    const customer = validateCustomer(body.customer);
    if (!customer) {
      return NextResponse.json(
        { ok: false, error: "missing_customer_details" },
        { status: 400 },
      );
    }

    const emailLimit = await consumeRateLimit(request, {
      identifier: customer.email,
      limit: 5,
      scope: "orders:create:email",
      windowMs: 60 * 60 * 1000,
    });

    if (!emailLimit.allowed) {
      return rateLimitResponse(
        emailLimit,
        "Trop de commandes ont ete tentees avec cette adresse email. Veuillez reessayer plus tard.",
      );
    }

    let items: OrderItemInput[] = [];

    if (session?.user?.id) {
      const cart = await Cart.findOne({ user: session.user.id })
        .select("items")
        .lean();

      const cartItems = Array.isArray(cart?.items) ? cart.items : [];

      items = cartItems.map(
        (item: {
          product?: unknown;
          quantity?: unknown;
          variantId?: unknown;
        }) => ({
          productId: String(item.product ?? ""),
          quantity: Number(item.quantity ?? 0),
          variantId: String(item.variantId ?? ""),
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
    const notes = normalizeText(body.notes, MAX_NOTES_LENGTH);

    const stockReserved = await reserveStock(build.items);

    if (!stockReserved) {
      return NextResponse.json(
        { ok: false, error: "stock_changed" },
        { status: 409 },
      );
    }

    let order;
    try {
      order = await Order.create({
        user: session?.user?.id ?? undefined,
        customer,
        items: build.items,
        subtotal: build.subtotal,
        shippingFee,
        total,
        status: "pending_confirmation",
        statusHistory: [
          {
            status: "pending_confirmation",
            note: "Commande passée",
            changedAt: new Date(),
            changedBy: session?.user?.id ?? null,
          },
        ],
        paymentMethod: "cod",
        source: session?.user?.id ? "user" : "guest",
        notes,
      });
    } catch (error) {
      await rollbackReservedStock(build.items);
      throw error;
    }

    if (session?.user?.id) {
      await cancelAbandonedCartReminder(session.user.id).catch(() => null);
      await Cart.findOneAndUpdate(
        { user: session.user.id },
        { $set: { items: [] } },
      ).catch(() => null);
    }

    revalidateProductCache(build.productSlugs);

    const emailPayload = {
      orderId: String(order._id),
      items: build.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        finalPrice: item.finalPrice,
        coverImage: item.coverImage,
        variantLabel: item.variantLabel,
        variantOptions: item.variantOptions,
      })),
      subtotal: build.subtotal,
      shippingFee,
      total,
      customer: {
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email,
        phone: customer.phone,
        street: customer.street,
        apartment: customer.apartment ?? "",
        city: customer.city,
        commune: customer.commune,
        country: customer.country ?? "Algeria",
      },
      notes,
      createdAt: order.createdAt,
    };

    await Promise.allSettled([
      recordProductAnalyticsEvents(
        build.items.map((item) => ({
          product: {
            coverImage: item.coverImage,
            finalPrice: item.finalPrice,
            name: item.name,
          },
          productId: String(item.product),
          quantity: item.quantity,
          type: "order",
          value: item.finalPrice,
        })),
      ),
      sendAdminOrderNotification(emailPayload),
      sendCustomerOrderConfirmation(emailPayload),
    ]);

    return NextResponse.json({ ok: true, orderId: String(order._id) });
  } catch (error) {
    console.error("Order creation failed:", error);
    return NextResponse.json(
      { ok: false, error: "order_creation_failed" },
      { status: 500 },
    );
  }
}
