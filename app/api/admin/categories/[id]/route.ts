import { NextResponse } from "next/server";
import slugify from "slugify";
import { Types } from "mongoose";

import { auth } from "@/lib/auth";
import { revalidateCategoryCache } from "@/lib/cache";
import startDbConnection from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeSlug = (value: string) =>
  slugify(value, { lower: true, strict: true, trim: true });

type CategoryPayload = {
  name?: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
};

const parseCategoryPayload = async (request: Request) => {
  let body: CategoryPayload = {};
  try {
    body = (await request.json()) as CategoryPayload;
  } catch {
    return { ok: false as const, error: "invalid_payload" };
  }

  const name = String(body.name ?? "").trim();
  const rawSlug = String(body.slug ?? "").trim();
  const image = String(body.image ?? "").trim();
  const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

  const slug = rawSlug ? normalizeSlug(rawSlug) : normalizeSlug(name);

  if (!name) return { ok: false as const, error: "name_required" };
  if (!image) return { ok: false as const, error: "image_required" };
  if (!slug) return { ok: false as const, error: "slug_required" };

  return {
    ok: true as const,
    payload: {
      name,
      slug,
      image,
      isActive,
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

  const category = await Category.findById(id)
    .select("name slug image isActive")
    .lean();

  if (!category) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  revalidateCategoryCache();

  return NextResponse.json({ ok: true, category });
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

  const parsed = await parseCategoryPayload(request);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400 },
    );
  }

  await startDbConnection();

  const nameRegex = new RegExp(`^${escapeRegex(parsed.payload.name)}$`, "i");
  const existingName = await Category.findOne({
    name: nameRegex,
    _id: { $ne: id },
  })
    .select("_id")
    .lean();
  if (existingName) {
    return NextResponse.json(
      { ok: false, error: "name_taken" },
      { status: 409 },
    );
  }

  const existingSlug = await Category.findOne({
    slug: parsed.payload.slug,
    _id: { $ne: id },
  })
    .select("_id")
    .lean();
  if (existingSlug) {
    return NextResponse.json(
      { ok: false, error: "slug_taken" },
      { status: 409 },
    );
  }

  const category = await Category.findByIdAndUpdate(id, parsed.payload, {
    returnDocument: "after",
    runValidators: true,
  })
    .select("name slug image isActive")
    .lean();

  if (!category) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, category });
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

  const deleted = await Category.findByIdAndDelete(id).lean();
  if (!deleted) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  await Product.updateMany({ categories: id }, { $pull: { categories: id } });

  revalidateCategoryCache();

  return NextResponse.json({ ok: true });
}
