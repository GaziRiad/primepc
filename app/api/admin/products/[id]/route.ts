import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { auth } from "@/lib/auth";
import startDbConnection from "@/lib/db";
import Cart from "@/models/Cart";
import Favorite from "@/models/Favorite";
import Product from "@/models/Product";
import { getDiscountedPrice } from "@/lib/utils";

const parseProductPayload = async (request: Request) => {
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return { ok: false as const, error: "invalid_payload" };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const brand = typeof body.brand === "string" ? body.brand.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const coverImage =
    typeof body.coverImage === "string" ? body.coverImage.trim() : "";

  const price = Number(body.price);
  const discount = Number(body.discount ?? 0);
  const stock = Number(body.stock ?? 0);

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

  if (!name) return { ok: false as const, error: "name_required" };
  if (!coverImage) {
    return { ok: false as const, error: "cover_image_required" };
  }
  if (!Number.isFinite(price) || price <= 0) {
    return { ok: false as const, error: "price_required" };
  }

  return {
    ok: true as const,
    payload: {
      name,
      brand,
      description,
      price: Number.isFinite(price) ? price : 0,
      discount: Number.isFinite(discount) ? discount : 0,
      stock: Number.isFinite(stock) ? stock : 0,
      coverImage,
      images,
      categories,
      specs,
      finalPrice: getDiscountedPrice(
        Number.isFinite(price) ? price : 0,
        Number.isFinite(discount) ? discount : 0,
      ),
    },
  };
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { ok: false, error: "invalid_id" },
      { status: 400 },
    );
  }

  await startDbConnection();

  const product = await Product.findById(id).lean();
  if (!product) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, product });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { ok: false, error: "invalid_id" },
      { status: 400 },
    );
  }

  const parsed = await parseProductPayload(request);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400 },
    );
  }

  await startDbConnection();

  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  product.set(parsed.payload);
  product.finalPrice = parsed.payload.finalPrice;

  try {
    await product.save();
    return NextResponse.json({ ok: true, product: product.toObject() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "server_error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { ok: false, error: "invalid_id" },
      { status: 400 },
    );
  }

  await startDbConnection();

  const deleted = await Product.findByIdAndDelete(id).lean();
  if (!deleted) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  await Promise.all([
    Favorite.deleteMany({ product: id }),
    Cart.updateMany(
      { "items.product": id },
      { $pull: { items: { product: id } } },
    ),
  ]);

  return NextResponse.json({ ok: true });
}
