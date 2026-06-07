import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { auth } from "@/lib/auth";
import { revalidateProductCache } from "@/lib/cache";
import startDbConnection from "@/lib/db";
import Product from "@/models/Product";
import { getDiscountedPrice } from "@/lib/utils";
import { sanitizeProductDescription } from "@/lib/productDescription";
import { parseProductVariants } from "@/lib/productVariants";

const parseProductIds = (value: unknown, excludedIds = new Set<string>()) => {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((item) => String(item ?? "").trim())
        .filter(
          (item) => Types.ObjectId.isValid(item) && !excludedIds.has(item),
        ),
    ),
  ).slice(0, 12);
};

const removeMissingRelationships = async (payload: {
  recommendedProducts: string[];
}) => {
  if (payload.recommendedProducts.length === 0) return;

  const existingIds = new Set(
    (
      await Product.find({
        _id: { $in: payload.recommendedProducts },
      }).distinct("_id")
    ).map(String),
  );
  payload.recommendedProducts = payload.recommendedProducts.filter((id) =>
    existingIds.has(id),
  );
};

const parseProductPayload = async (request: Request, requireAll: boolean) => {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return { ok: false as const, error: "invalid_payload" };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const brand = typeof body.brand === "string" ? body.brand.trim() : "";
  const description = sanitizeProductDescription(body.description);
  const coverImage =
    typeof body.coverImage === "string" ? body.coverImage.trim() : "";

  const price = Number(body.price);
  const discount = Number(body.discount ?? 0);
  const stock = Number(body.stock ?? 0);
  const safePrice = Number.isFinite(price) ? price : 0;
  const safeDiscount = Number.isFinite(discount) ? discount : 0;
  const variants = parseProductVariants(body.variants, safePrice, safeDiscount);
  const priorityRaw = Math.floor(Number(body.recommendationPriority ?? 0));
  const recommendationPriority = Number.isFinite(priorityRaw)
    ? Math.min(100, Math.max(0, priorityRaw))
    : 0;
  const recommendedProducts = parseProductIds(body.recommendedProducts);
  const totalStock =
    variants.length > 0
      ? variants.reduce(
          (sum, variant) => sum + (variant.active ? variant.stock : 0),
          0,
        )
      : Number.isFinite(stock)
        ? stock
        : 0;

  const images = Array.isArray(body.images)
    ? body.images.map((value) => String(value ?? "").trim()).filter(Boolean)
    : [];

  const categories = Array.isArray(body.categories)
    ? body.categories
        .map((value) => String(value ?? "").trim())
        .filter((value) => Types.ObjectId.isValid(value))
    : [];

  const specs: Record<string, string> = {};

  if (body.specs && typeof body.specs === "object") {
    if (Array.isArray(body.specs)) {
      for (const item of body.specs) {
        if (!item || typeof item !== "object") continue;
        const key = String((item as { key?: unknown }).key ?? "").trim();
        const value = String((item as { value?: unknown }).value ?? "").trim();
        if (key && value) specs[key] = value;
      }
    } else {
      for (const [key, value] of Object.entries(
        body.specs as Record<string, unknown>,
      )) {
        const cleanKey = String(key ?? "").trim();
        const cleanValue = String(value ?? "").trim();
        if (cleanKey && cleanValue) specs[cleanKey] = cleanValue;
      }
    }
  }

  if (requireAll) {
    if (!name) return { ok: false as const, error: "name_required" };
    if (!coverImage) {
      return { ok: false as const, error: "cover_image_required" };
    }
    if (!Number.isFinite(price) || price <= 0) {
      return { ok: false as const, error: "price_required" };
    }
  }

  return {
    ok: true as const,
    payload: {
      name,
      brand,
      description,
      price: safePrice,
      discount: safeDiscount,
      stock: totalStock,
      coverImage,
      images,
      categories,
      specs,
      variants,
      recommendedProducts,
      similarProducts: [],
      accessoryProducts: [],
      recommendationPriority,
      finalPrice: getDiscountedPrice(safePrice, safeDiscount),
    },
  };
};

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const parsed = await parseProductPayload(request, true);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400 },
    );
  }

  await startDbConnection();
  await removeMissingRelationships(parsed.payload);

  try {
    const product = await Product.create(parsed.payload);
    revalidateProductCache([product.slug]);
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "server_error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("q") ?? "").trim();
  const exclude = (searchParams.get("exclude") ?? "").trim();
  const limitRaw = Number(searchParams.get("limit"));
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.floor(limitRaw), 50)
      : 20;

  await startDbConnection();

  const filter: Record<string, unknown> = {};
  if (Types.ObjectId.isValid(exclude)) {
    filter._id = { $ne: exclude };
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [{ name: regex }, { brand: regex }, { slug: regex }];
  }

  const products = await Product.find(filter)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select(
      "name brand price finalPrice discount stock coverImage slug recommendationPriority updatedAt",
    )
    .lean();

  return NextResponse.json({ ok: true, products });
}
