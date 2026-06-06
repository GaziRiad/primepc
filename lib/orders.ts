import { Types, type SortOrder } from "mongoose";

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

type OrdersQuery = { [key: string]: string | string[] | undefined };

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

const toSingle = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildAdminOrdersFilter = (query?: OrdersQuery) => {
  const statusRaw = toSingle(query?.status);
  const sortRaw = toSingle(query?.sort);
  const archivedRaw = toSingle(query?.archived);
  const fromRaw = toSingle(query?.from);
  const toRaw = toSingle(query?.to);
  const searchRaw = toSingle(query?.q)?.trim().slice(0, 80);

  const filter: Record<string, unknown> = {};

  if (statusRaw && ORDER_STATUSES.includes(statusRaw as OrderStatus)) {
    filter.status = statusRaw;
  }

  if (archivedRaw === "archived") {
    filter.archived = true;
  } else if (archivedRaw === "all") {
    // no filter
  } else {
    filter.archived = { $ne: true };
  }

  const createdAt: { $gte?: Date; $lte?: Date } = {};
  if (fromRaw) {
    const fromDate = new Date(fromRaw);
    if (!Number.isNaN(fromDate.getTime())) {
      fromDate.setHours(0, 0, 0, 0);
      createdAt.$gte = fromDate;
    }
  }

  if (toRaw) {
    const toDate = new Date(toRaw);
    if (!Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      createdAt.$lte = toDate;
    }
  }

  if (createdAt.$gte || createdAt.$lte) {
    filter.createdAt = createdAt;
  }

  if (searchRaw) {
    const escaped = escapeRegex(searchRaw);
    const regex = new RegExp(escaped, "i");
    const searchConditions: Record<string, unknown>[] = [
      { "customer.firstName": regex },
      { "customer.lastName": regex },
      { "customer.phone": regex },
      { "customer.email": regex },
      { "customer.street": regex },
      { "customer.apartment": regex },
      { "customer.city": regex },
      { "customer.commune": regex },
      { "items.name": regex },
      { notes: regex },
    ];

    if (Types.ObjectId.isValid(searchRaw)) {
      searchConditions.unshift({ _id: new Types.ObjectId(searchRaw) });
    }

    if (/^[a-f0-9]{4,24}$/i.test(searchRaw)) {
      searchConditions.push({
        $expr: {
          $regexMatch: {
            input: { $toString: "$_id" },
            options: "i",
            regex: escaped,
          },
        },
      });
    }

    filter.$or = searchConditions;
  }

  const sort =
    sortRaw === "oldest" || sortRaw === "status" ? sortRaw : "newest";

  return { filter, sort };
};

export const buildOrderItems = async (items: OrderItemInput[]) => {
  await startDbConnection();

  const normalized = normalizeItems(items);
  if (normalized.length === 0) {
    return { ok: false as const, issues: [] as OrderBuildIssue[] };
  }

  const ids = normalized.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: ids } })
    .select("name slug price discount finalPrice coverImage stock")
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

  return {
    ok: true as const,
    items: orderItems,
    productSlugs: products
      .map((product) =>
        typeof product.slug === "string" ? product.slug : undefined,
      )
      .filter((slug): slug is string => Boolean(slug)),
    subtotal,
  };
};

export const getOrdersForAdmin = async () => {
  await startDbConnection();

  return Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .lean();
};

export const getOrdersForAdminPage = async (query?: OrdersQuery) => {
  await startDbConnection();

  const { filter, sort } = buildAdminOrdersFilter(query);

  const limit = 10;
  const totalPromise = Order.countDocuments(filter);
  const total = await totalPromise;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const requestedPage = Number(toSingle(query?.page)) || 1;
  const page = Math.max(1, Math.min(requestedPage, totalPages || 1));
  const skip = (page - 1) * limit;

  if (sort === "status") {
    const statusRank = ORDER_STATUSES.map((status, index) => ({
      case: { $eq: ["$status", status] },
      then: index,
    }));

    const items = await Order.aggregate([
      { $match: filter },
      {
        $addFields: {
          statusRank: { $switch: { branches: statusRank, default: 99 } },
        },
      },
      { $sort: { statusRank: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { statusRank: 0 } },
    ]);

    return { items, total, page, limit, totalPages };
  }

  const sortSpec: Record<string, SortOrder> =
    sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  const [items] = await Promise.all([
    Order.find(filter).sort(sortSpec).skip(skip).limit(limit).lean(),
  ]);

  return { items, total, page, limit, totalPages };
};

export const getOrdersForAdminExportCursor = async (query?: OrdersQuery) => {
  await startDbConnection();

  const { filter, sort } = buildAdminOrdersFilter(query);

  if (sort === "status") {
    const statusRank = ORDER_STATUSES.map((status, index) => ({
      case: { $eq: ["$status", status] },
      then: index,
    }));

    return Order.aggregate([
      { $match: filter },
      {
        $addFields: {
          statusRank: { $switch: { branches: statusRank, default: 99 } },
        },
      },
      { $sort: { statusRank: 1, createdAt: -1 } },
      { $project: { statusRank: 0 } },
    ]).cursor({ batchSize: 200 });
  }

  const sortSpec: Record<string, SortOrder> =
    sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

  return Order.find(filter).sort(sortSpec).lean().cursor({ batchSize: 200 });
};

export const getOrdersForUser = async (userId: string) => {
  await startDbConnection();

  if (!userId) return [];

  return Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("items.quantity total status createdAt")
    .lean();
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
    { returnDocument: "after" },
  ).lean();
};

export const updateOrderArchive = async (
  orderId: string,
  archived: boolean,
  changedBy?: string,
) => {
  await startDbConnection();

  const update: Record<string, unknown> = {
    archived,
    archivedAt: archived ? new Date() : null,
    archivedBy: null,
  };

  if (archived && changedBy && Types.ObjectId.isValid(changedBy)) {
    update.archivedBy = new Types.ObjectId(changedBy);
  }

  return Order.findByIdAndUpdate(
    orderId,
    { $set: update },
    { returnDocument: "after" },
  ).lean();
};
