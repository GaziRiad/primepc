import { NextResponse } from "next/server";
import slugify from "slugify";

import { auth } from "@/lib/auth";
import startDbConnection from "@/lib/db";
import Category from "@/models/Category";

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

const parseCategoryPayload = async (request: Request, requireAll: boolean) => {
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

  if (requireAll) {
    if (!name) return { ok: false as const, error: "name_required" };
    if (!image) return { ok: false as const, error: "image_required" };
    if (!slug) return { ok: false as const, error: "slug_required" };
  }

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

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get("q") ?? "").trim();

  await startDbConnection();

  const filter: Record<string, unknown> = {};
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [{ name: regex }, { slug: regex }];
  }

  const categories = await Category.find(filter)
    .sort({ updatedAt: -1 })
    .select("name slug image isActive updatedAt")
    .lean();

  return NextResponse.json({ ok: true, categories });
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const parsed = await parseCategoryPayload(request, true);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400 },
    );
  }

  await startDbConnection();

  const nameRegex = new RegExp(`^${escapeRegex(parsed.payload.name)}$`, "i");
  const existingName = await Category.findOne({ name: nameRegex })
    .select("_id")
    .lean();
  if (existingName) {
    return NextResponse.json(
      { ok: false, error: "name_taken" },
      { status: 409 },
    );
  }

  const existingSlug = await Category.findOne({ slug: parsed.payload.slug })
    .select("_id")
    .lean();
  if (existingSlug) {
    return NextResponse.json(
      { ok: false, error: "slug_taken" },
      { status: 409 },
    );
  }

  try {
    const category = await Category.create(parsed.payload);
    return NextResponse.json({ ok: true, category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "server_error";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
