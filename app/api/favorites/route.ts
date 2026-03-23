import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMyFavoriteProductIds } from "@/lib/services";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);

  const ids = await getMyFavoriteProductIds(session.user.id);
  return NextResponse.json(ids);
}
