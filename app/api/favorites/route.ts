import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMyFavoriteProducts } from "@/lib/services";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json([]);

  const favProducts = await getMyFavoriteProducts(session.user.id);
  return NextResponse.json(favProducts);
}
