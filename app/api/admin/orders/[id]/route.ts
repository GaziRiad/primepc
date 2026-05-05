import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { auth } from "@/lib/auth";
import { ORDER_STATUSES, updateOrderStatus } from "@/lib/orders";

type PatchBody = {
  status?: string;
  note?: string;
};

const normalizeId = (value: unknown) => {
  const raw = String(value ?? "").trim();
  const match = raw.match(/[a-f0-9]{24}/i);
  return match ? match[0] : raw;
};

const getIdFromRequest = (request: Request, paramsId?: unknown) => {
  if (typeof paramsId === "string" && paramsId.trim()) {
    return paramsId;
  }

  try {
    const { pathname } = new URL(request.url);
    const segments = pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? "";
  } catch {
    return "";
  }
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    let body: PatchBody;
    try {
      body = (await request.json()) as PatchBody;
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_payload" },
        { status: 400 },
      );
    }

    const status = body.status;
    if (!status || !ORDER_STATUSES.includes(status as never)) {
      return NextResponse.json(
        { ok: false, error: "invalid_status" },
        { status: 400 },
      );
    }

    const rawId = getIdFromRequest(request, params?.id);
    const normalizedId = normalizeId(rawId);

    if (!normalizedId) {
      return NextResponse.json(
        { ok: false, error: "invalid_id" },
        { status: 400 },
      );
    }

    let order = null;
    try {
      order = await updateOrderStatus(
        normalizedId,
        status as never,
        body.note ?? "",
        session.user.id,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "server_error";
      if (message.toLowerCase().includes("cast to objectid")) {
        return NextResponse.json(
          { ok: false, error: "invalid_id" },
          { status: 400 },
        );
      }
      throw error;
    }

    if (!order) {
      return NextResponse.json(
        { ok: false, error: "not_found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "server_error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
