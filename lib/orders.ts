import { Types } from "mongoose";

import startDbConnection from "@/lib/db";
import { getDiscountedPrice } from "@/lib/utils";
import Order from "@/models/Order";
import Product from "@/models/Product";

export const ORDER_STATUSES = [
  "pending_confirmation",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const SHIPPING_THRESHOLD = 40000;
export const SHIPPING_FEE = 500;

export type OrderItemInput = {
  productId: string;
  quantity: number;
};

export type OrderBuildIssue = {
  productId: string;
  reason: "not_found" | "out_of_stock" | "invalid_quantity";
  available?: number;
};

type OrderItemSnapshot = {
  product: Types.ObjectId;
  name: string;
  coverImage: string;
  unitPrice: number;
  finalPrice: number;
  quantity: number;
};

export type CustomerDetails = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  apartment?: string;
  city: string;
  commune: string;
  country?: string;
};

const normalizeItems = (items: OrderItemInput[]) =>
  items
    .map((item) => ({
      productId: String(item.productId ?? "").trim(),
      quantity: Math.floor(Number(item.quantity ?? 0)),
    }))
    .filter((item) => item.productId && Number.isFinite(item.quantity));

export const buildOrderItems = async (items: OrderItemInput[]) => {
  await startDbConnection();

  const normalized = normalizeItems(items);
  if (normalized.length === 0) {
    return { ok: false as const, issues: [] as OrderBuildIssue[] };
  }

  const ids = normalized.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids } })
    .select("name price discount finalPrice coverImage stock")
    .lean();

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );

  const issues: OrderBuildIssue[] = [];
  const orderItems: OrderItemSnapshot[] = [];
  let subtotal = 0;

  for (const item of normalized) {
    if (!item.productId || item.quantity <= 0) {
      issues.push({
        productId: item.productId,
        reason: "invalid_quantity",
      });
      continue;
    }

    const product = productMap.get(item.productId);
    if (!product) {
      issues.push({ productId: item.productId, reason: "not_found" });
      continue;
    }

    const stock = Number(product.stock ?? 0);
    if (!Number.isFinite(stock) || stock < item.quantity) {
      issues.push({
        productId: item.productId,
        reason: "out_of_stock",
        available: Number.isFinite(stock) ? stock : 0,
      });
      continue;
    }

    const unitPrice = Number(product.price ?? 0);
    const finalPrice = Number.isFinite(Number(product.finalPrice))
      ? Number(product.finalPrice)
      : getDiscountedPrice(unitPrice, Number(product.discount ?? 0));

    orderItems.push({
      product: product._id,
      name: product.name,
      coverImage: product.coverImage ?? "",
      unitPrice,
      finalPrice,
      quantity: item.quantity,
    });

    subtotal += finalPrice * item.quantity;
  }

  if (issues.length > 0) {
    return { ok: false as const, issues };
  }

  return { ok: true as const, items: orderItems, subtotal };
};

export const getOrdersForAdmin = async () => {
  await startDbConnection();

  return Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .lean();
};

export const getOrdersForUser = async (userId: string) => {
  await startDbConnection();

  if (!userId) return [];

  return Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  note = "",
  changedBy?: string,
) => {
  await startDbConnection();

  const historyEntry: {
    status: OrderStatus;
    note: string;
    changedAt: Date;
    changedBy?: Types.ObjectId;
  } = {
    status,
    note,
    changedAt: new Date(),
  };

  if (changedBy && Types.ObjectId.isValid(changedBy)) {
    historyEntry.changedBy = new Types.ObjectId(changedBy);
  }

  return Order.findByIdAndUpdate(
    orderId,
    {
      $set: { status },
      $push: {
        statusHistory: historyEntry,
      },
    },
    { new: true },
  ).lean();
};
