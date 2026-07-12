import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { revalidateProductCache } from "@/lib/cache";
import { cancelAbandonedCartReminder } from "@/lib/cartRecovery";
import startDbConnection from "@/lib/db";
import { normalizeDeliveryMethod } from "@/lib/delivery";
import { normalizeWilayaName } from "@/lib/locations";
import {
  sendAdminOrderNotification,
  sendCustomerOrderConfirmation,
} from "@/lib/notifications";
import {
  createOrderFingerprint,
  normalizeIdempotencyKey,
} from "@/lib/orderIdempotency";
import { reserveOrderStock } from "@/lib/orderInventory";
import {
  buildOrderItems,
  type CustomerDetails,
  type OrderItemInput,
} from "@/lib/orders";
import { getDeliveryFee } from "@/lib/delivery";
import { recordProductAnalyticsEvents } from "@/lib/productAnalytics";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import Cart from "@/models/Cart";
import Order from "@/models/Order";

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
  deliveryMethod?: unknown;
  items?: OrderItemInput[];
  notes?: string;
};

type SuccessfulBuild = Extract<
  Awaited<ReturnType<typeof buildOrderItems>>,
  { ok: true }
>;

class OrderFlowError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

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
    city:
      normalizeWilayaName(customer.city) || normalizeText(customer.city, 80),
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

  if (!hasRequiredFields || phoneDigits.length < 8) return null;
  if (!normalizeWilayaName(normalized.city)) return null;
  if (!EMAIL_REGEX.test(normalized.email)) return null;
  return normalized;
};

const isDuplicateKeyError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === 11000;

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

    const idempotencyKey = normalizeIdempotencyKey(
      request.headers.get("idempotency-key"),
    );
    if (!idempotencyKey) {
      return NextResponse.json(
        { ok: false, error: "invalid_idempotency_key" },
        { status: 400 },
      );
    }

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

    const deliveryMethod = normalizeDeliveryMethod(body.deliveryMethod);
    if (!deliveryMethod) {
      return NextResponse.json(
        { ok: false, error: "invalid_delivery_method" },
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

    await startDbConnection();
    const authSession = await auth();
    const userId = authSession?.user?.id;
    const notes = normalizeText(body.notes, MAX_NOTES_LENGTH);
    const requestedItems = (Array.isArray(body.items) ? body.items : []).map(
      (item) => ({
        productId: String(item.productId ?? "").trim(),
        quantity: Math.floor(Number(item.quantity ?? 0)),
        variantId: String(item.variantId ?? "").trim(),
      }),
    );
    const fingerprint = createOrderFingerprint({
      customer,
      deliveryMethod,
      items: requestedItems,
      notes,
      userId: userId ?? "",
    });
    const dbSession = await mongoose.startSession();

    let orderId = "";
    let orderCreatedAt: Date | null = null;
    let committedBuild: SuccessfulBuild | null = null;
    let replayed = false;

    try {
      await dbSession.withTransaction(async () => {
        const existing = await Order.findOne({ idempotencyKey }).session(
          dbSession,
        );
        if (existing) {
          if (existing.idempotencyFingerprint !== fingerprint) {
            throw new OrderFlowError("idempotency_conflict", 409);
          }
          orderId = String(existing._id);
          replayed = true;
          return;
        }

        let items: OrderItemInput[];

        if (userId) {
          const cart = await Cart.findOne({ user: userId })
            .select("items")
            .session(dbSession)
            .lean();

          items = (Array.isArray(cart?.items) ? cart.items : []).map(
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
          items = requestedItems;
        }

        if (items.length === 0) {
          throw new OrderFlowError("empty_cart", 400);
        }

        const build = await buildOrderItems(items, dbSession);
        if (!build.ok) {
          throw new OrderFlowError("invalid_items", 409, {
            issues: build.issues,
          });
        }

        await reserveOrderStock(build.items, dbSession);

        const shippingFee = getDeliveryFee(deliveryMethod);
        const total = build.subtotal + shippingFee;

        const [order] = await Order.create(
          [
            {
              user: userId ?? undefined,
              customer,
              items: build.items,
              subtotal: build.subtotal,
              shippingFee,
              total,
              deliveryMethod,
              status: "pending_confirmation",
              statusHistory: [
                {
                  status: "pending_confirmation",
                  note: "Commande passee",
                  changedAt: new Date(),
                  changedBy: userId ?? null,
                },
              ],
              idempotencyKey,
              idempotencyFingerprint: fingerprint,
              paymentMethod: "cod",
              source: userId ? "user" : "guest",
              notes,
            },
          ],
          { session: dbSession },
        );

        if (userId) {
          await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } },
            { session: dbSession },
          );
        }

        orderId = String(order._id);
        orderCreatedAt = order.createdAt;
        committedBuild = build;
      });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const existing = await Order.findOne({ idempotencyKey }).lean();
        if (existing?.idempotencyFingerprint === fingerprint) {
          return NextResponse.json({
            ok: true,
            orderId: String(existing._id),
            replayed: true,
          });
        }
        throw new OrderFlowError("idempotency_conflict", 409);
      }
      throw error;
    } finally {
      await dbSession.endSession();
    }

    if (replayed) {
      return NextResponse.json({ ok: true, orderId, replayed: true });
    }

    const finalBuild = committedBuild as SuccessfulBuild | null;
    const finalCreatedAt = orderCreatedAt as Date | null;

    if (!finalBuild || !finalCreatedAt) {
      throw new Error("order_creation_failed");
    }

    if (userId) {
      await cancelAbandonedCartReminder(userId).catch(() => null);
    }

    revalidateProductCache(finalBuild.productSlugs);

    const shippingFee = getDeliveryFee(deliveryMethod);
    const total = finalBuild.subtotal + shippingFee;
    const emailPayload = {
      orderId,
      items: finalBuild.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        finalPrice: item.finalPrice,
        coverImage: item.coverImage,
        variantLabel: item.variantLabel,
        variantOptions: item.variantOptions,
      })),
      subtotal: finalBuild.subtotal,
      shippingFee,
      total,
      deliveryMethod,
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
      createdAt: finalCreatedAt,
    };

    await Promise.allSettled([
      recordProductAnalyticsEvents(
        finalBuild.items.map((item) => ({
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

    return NextResponse.json({ ok: true, orderId, replayed: false });
  } catch (error) {
    if (error instanceof OrderFlowError) {
      return NextResponse.json(
        { ok: false, error: error.message, ...error.details },
        { status: error.status },
      );
    }
    if (error instanceof Error && error.message === "stock_changed") {
      return NextResponse.json(
        { ok: false, error: "stock_changed" },
        { status: 409 },
      );
    }

    console.error("Order creation failed:", error);
    return NextResponse.json(
      { ok: false, error: "order_creation_failed" },
      { status: 500 },
    );
  }
}
