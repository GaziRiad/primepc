import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getOrdersForAdmin } from "@/lib/orders";

export async function GET() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const orders = await getOrdersForAdmin();
  return NextResponse.json({ ok: true, orders });
}
