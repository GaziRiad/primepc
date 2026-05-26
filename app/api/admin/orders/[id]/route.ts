import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import {
  ORDER_STATUSES,
  updateOrderArchive,
  updateOrderStatus,
} from "@/lib/orders";

type PatchBody = {
  status?: string;
  note?: string;
  archived?: boolean;
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
  { params }: { params: Promise<{ id: string }> },
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
    const hasStatus = typeof status === "string";
    const hasArchive = typeof body.archived === "boolean";

    if (!hasStatus && !hasArchive) {
      return NextResponse.json(
        { ok: false, error: "invalid_payload" },
        { status: 400 },
      );
    }

    if (hasStatus && !ORDER_STATUSES.includes(status as never)) {
      return NextResponse.json(
        { ok: false, error: "invalid_status" },
        { status: 400 },
      );
    }

    const { id } = await params;
    const rawId = getIdFromRequest(request, id);
    const normalizedId = normalizeId(rawId);

    if (!normalizedId) {
      return NextResponse.json(
        { ok: false, error: "invalid_id" },
        { status: 400 },
      );
    }

    let order = null;
    try {
      if (hasStatus) {
        order = await updateOrderStatus(
          normalizedId,
          status as never,
          body.note ?? "",
          session.user.id,
        );
      }

      if (hasArchive) {
        order = await updateOrderArchive(
          normalizedId,
          Boolean(body.archived),
          session.user.id,
        );
      }
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
