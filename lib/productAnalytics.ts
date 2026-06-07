import { Types } from "mongoose";

import startDbConnection from "@/lib/db";
import Order from "@/models/Order";
import ProductAnalytics from "@/models/ProductAnalytics";

const ANALYTICS_TIMEZONE = "Africa/Algiers";
const MAX_BATCH_SIZE = 25;

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  day: "2-digit",
  month: "2-digit",
  timeZone: ANALYTICS_TIMEZONE,
  year: "numeric",
});

export type ProductAnalyticsEventType =
  | "view"
  | "add_to_cart"
  | "checkout_start"
  | "order";

export type ProductAnalyticsSnapshot = {
  coverImage?: string;
  finalPrice?: number;
  name?: string;
  slug?: string;
};

export type ProductAnalyticsEvent = {
  product?: ProductAnalyticsSnapshot;
  productId: string;
  quantity?: number;
  type: ProductAnalyticsEventType;
  value?: number;
};

type ProductMetric = {
  addToCarts: number;
  addedToCartValue: number;
  checkoutStartItems: number;
  checkoutStarts: number;
  coverImage: string;
  finalPrice: number;
  name: string;
  orderedRevenue: number;
  orderedUnits: number;
  orders: number;
  productId: string;
  slug: string;
  views: number;
};

export type ProductAnalyticsSummary = {
  days: number;
  topAddedToCart: ProductMetric[];
  topCheckoutStarted: ProductMetric[];
  topOrdered: ProductMetric[];
  topViewed: ProductMetric[];
  totals: {
    addToCarts: number;
    checkoutStarts: number;
    orderedRevenue: number;
    orderedUnits: number;
    orders: number;
    views: number;
  };
};

export const getAnalyticsDateKey = (date = new Date()) =>
  dateFormatter.format(date);

const sanitizeText = (value: unknown, maxLength = 160) =>
  String(value ?? "")
    .trim()
    .slice(0, maxLength);

const sanitizeNumber = (value: unknown) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) && number > 0 ? number : 0;
};

const sanitizeQuantity = (value: unknown) => {
  const quantity = Math.floor(Number(value ?? 1));
  if (!Number.isFinite(quantity) || quantity <= 0) return 1;
  return Math.min(quantity, 99);
};

const normalizeEvent = (event: ProductAnalyticsEvent) => {
  const productId = String(event.productId ?? "").trim();
  if (!Types.ObjectId.isValid(productId)) return null;

  const quantity = sanitizeQuantity(event.quantity);
  const value = sanitizeNumber(event.value ?? event.product?.finalPrice);

  return {
    productId,
    quantity,
    type: event.type,
    value,
    snapshot: {
      coverImage: sanitizeText(event.product?.coverImage, 400),
      finalPrice: sanitizeNumber(event.product?.finalPrice),
      name: sanitizeText(event.product?.name),
      slug: sanitizeText(event.product?.slug, 180),
    },
  };
};

const buildIncrement = (
  type: ProductAnalyticsEventType,
  quantity: number,
  value: number,
): Record<string, number> | null => {
  switch (type) {
    case "view":
      return { views: 1 };
    case "add_to_cart":
      return {
        addToCarts: quantity,
        addedToCartValue: value * quantity,
      };
    case "checkout_start":
      return {
        checkoutStarts: 1,
        checkoutStartItems: quantity,
      };
    case "order":
      return {
        orderedRevenue: value * quantity,
        orderedUnits: quantity,
        orders: 1,
      };
    default:
      return null;
  }
};

export const recordProductAnalyticsEvents = async (
  events: ProductAnalyticsEvent[],
) => {
  const normalized = events.slice(0, MAX_BATCH_SIZE).map(normalizeEvent);
  const validEvents = normalized.filter(
    (event): event is NonNullable<typeof event> => Boolean(event),
  );

  if (validEvents.length === 0) return;

  await startDbConnection();

  const date = getAnalyticsDateKey();
  const operations = validEvents
    .map((event) => {
      const increment = buildIncrement(event.type, event.quantity, event.value);
      if (!increment) return null;
      const set: Record<string, unknown> = {};

      if (event.snapshot.name) set.name = event.snapshot.name;
      if (event.snapshot.slug) set.slug = event.snapshot.slug;
      if (event.snapshot.coverImage) {
        set.coverImage = event.snapshot.coverImage;
      }
      if (event.snapshot.finalPrice > 0) {
        set.finalPrice = event.snapshot.finalPrice;
      }

      const update: {
        $inc: Record<string, number>;
        $set?: Record<string, unknown>;
        $setOnInsert: {
          date: string;
          product: Types.ObjectId;
        };
      } = {
        $inc: increment,
        $setOnInsert: {
          date,
          product: new Types.ObjectId(event.productId),
        },
      };

      if (Object.keys(set).length > 0) {
        update.$set = set;
      }

      return {
        updateOne: {
          filter: {
            date,
            product: new Types.ObjectId(event.productId),
          },
          update,
          upsert: true,
        },
      };
    })
    .filter((operation): operation is NonNullable<typeof operation> =>
      Boolean(operation),
    );

  if (operations.length === 0) return;

  await ProductAnalytics.bulkWrite(operations, { ordered: false });
};

const getStartDateKey = (days: number) => {
  const start = new Date();
  start.setDate(start.getDate() - (days - 1));
  return getAnalyticsDateKey(start);
};

const sortBy = (metric: keyof ProductMetric, products: ProductMetric[]) =>
  [...products].sort((a, b) => Number(b[metric]) - Number(a[metric]));

export const getProductAnalyticsSummary = async (
  days = 30,
  limit = 5,
): Promise<ProductAnalyticsSummary> => {
  await startDbConnection();

  const startDate = getStartDateKey(days);
  const orderStartDate = new Date();
  orderStartDate.setDate(orderStartDate.getDate() - (days - 1));
  orderStartDate.setHours(0, 0, 0, 0);

  const [products, orderedProducts] = (await Promise.all([
    ProductAnalytics.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $sort: {
          date: 1,
          updatedAt: 1,
        },
      },
      {
        $group: {
          _id: "$product",
          addToCarts: { $sum: "$addToCarts" },
          addedToCartValue: { $sum: "$addedToCartValue" },
          checkoutStartItems: { $sum: "$checkoutStartItems" },
          checkoutStarts: { $sum: "$checkoutStarts" },
          coverImage: { $last: "$coverImage" },
          finalPrice: { $last: "$finalPrice" },
          name: { $last: "$name" },
          orderedRevenue: { $sum: "$orderedRevenue" },
          orderedUnits: { $sum: "$orderedUnits" },
          orders: { $sum: "$orders" },
          slug: { $last: "$slug" },
          views: { $sum: "$views" },
        },
      },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: orderStartDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          coverImage: { $last: "$items.coverImage" },
          finalPrice: { $last: "$items.finalPrice" },
          name: { $last: "$items.name" },
          orderedRevenue: {
            $sum: { $multiply: ["$items.finalPrice", "$items.quantity"] },
          },
          orderedUnits: { $sum: "$items.quantity" },
          orders: { $sum: 1 },
        },
      },
      {
        $lookup: {
          as: "product",
          foreignField: "_id",
          from: "products",
          localField: "_id",
        },
      },
      {
        $addFields: {
          slug: { $ifNull: [{ $first: "$product.slug" }, ""] },
        },
      },
      { $project: { product: 0 } },
    ]),
  ])) as [
    Array<Omit<ProductMetric, "productId"> & { _id: Types.ObjectId }>,
    Array<
      Pick<
        ProductMetric,
        | "coverImage"
        | "finalPrice"
        | "name"
        | "orderedRevenue"
        | "orderedUnits"
        | "orders"
        | "slug"
      > & { _id: Types.ObjectId }
    >,
  ];

  const normalizedProducts = products.map((product) => ({
    addToCarts: Number(product.addToCarts ?? 0),
    addedToCartValue: Number(product.addedToCartValue ?? 0),
    checkoutStartItems: Number(product.checkoutStartItems ?? 0),
    checkoutStarts: Number(product.checkoutStarts ?? 0),
    coverImage: String(product.coverImage ?? ""),
    finalPrice: Number(product.finalPrice ?? 0),
    name: String(product.name ?? "Produit inconnu"),
    orderedRevenue: Number(product.orderedRevenue ?? 0),
    orderedUnits: Number(product.orderedUnits ?? 0),
    orders: Number(product.orders ?? 0),
    productId: String(product._id ?? ""),
    slug: String(product.slug ?? ""),
    views: Number(product.views ?? 0),
  }));

  const orderedMetrics = orderedProducts.map((product) => ({
    addToCarts: 0,
    addedToCartValue: 0,
    checkoutStartItems: 0,
    checkoutStarts: 0,
    coverImage: String(product.coverImage ?? ""),
    finalPrice: Number(product.finalPrice ?? 0),
    name: String(product.name ?? "Produit inconnu"),
    orderedRevenue: Number(product.orderedRevenue ?? 0),
    orderedUnits: Number(product.orderedUnits ?? 0),
    orders: Number(product.orders ?? 0),
    productId: String(product._id ?? ""),
    slug: String(product.slug ?? ""),
    views: 0,
  }));

  const activityTotals = normalizedProducts.reduce(
    (sum, product) => ({
      addToCarts: sum.addToCarts + product.addToCarts,
      checkoutStarts: sum.checkoutStarts + product.checkoutStarts,
      orderedRevenue: sum.orderedRevenue,
      orderedUnits: sum.orderedUnits,
      orders: sum.orders,
      views: sum.views + product.views,
    }),
    {
      addToCarts: 0,
      checkoutStarts: 0,
      orderedRevenue: 0,
      orderedUnits: 0,
      orders: 0,
      views: 0,
    },
  );
  const orderTotals = orderedMetrics.reduce(
    (sum, product) => ({
      orderedRevenue: sum.orderedRevenue + product.orderedRevenue,
      orderedUnits: sum.orderedUnits + product.orderedUnits,
      orders: sum.orders + product.orders,
    }),
    {
      orderedRevenue: 0,
      orderedUnits: 0,
      orders: 0,
    },
  );

  return {
    days,
    topAddedToCart: sortBy("addToCarts", normalizedProducts).slice(0, limit),
    topCheckoutStarted: sortBy("checkoutStarts", normalizedProducts).slice(
      0,
      limit,
    ),
    topOrdered: sortBy("orderedRevenue", orderedMetrics).slice(0, limit),
    topViewed: sortBy("views", normalizedProducts).slice(0, limit),
    totals: {
      ...activityTotals,
      ...orderTotals,
    },
  };
};
