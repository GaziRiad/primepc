import { NextResponse } from "next/server";
import Product from "@/models/Product";
import startDbConnection from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";
  const rawLimit = Number(searchParams.get("limit"));
  const query = rawQuery.trim();

  if (!query) {
    return NextResponse.json({ items: [] });
  }

  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0
      ? Math.min(Math.floor(rawLimit), 10)
      : 6;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  await startDbConnection();

  const items = await Product.find({
    $or: [{ name: regex }, { brand: regex }, { description: regex }],
  })
    .select("name slug coverImage finalPrice price discount")
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ items });
}
