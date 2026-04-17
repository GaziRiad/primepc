import { getCartItems } from "@/lib/services";
import { NextResponse } from "next/server";

export async function GET() {
  const cart = await getCartItems();
  return NextResponse.json(cart);
}
