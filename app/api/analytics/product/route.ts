import { NextResponse } from "next/server";

import {
  recordProductAnalyticsEvents,
  type ProductAnalyticsEvent,
} from "@/lib/productAnalytics";

type AnalyticsPayload = {
  events?: ProductAnalyticsEvent[];
};

const isValidEventType = (value: unknown) =>
  value === "view" ||
  value === "add_to_cart" ||
  value === "checkout_start";

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as
      | AnalyticsPayload
      | ProductAnalyticsEvent
      | null;

    const rawEvents = Array.isArray((body as AnalyticsPayload)?.events)
      ? ((body as AnalyticsPayload).events ?? [])
      : body
        ? [body as ProductAnalyticsEvent]
        : [];

    const events = rawEvents
      .filter((event) => isValidEventType(event?.type))
      .map((event) => ({
        product: event.product,
        productId: String(event.productId ?? ""),
        quantity: event.quantity,
        type: event.type,
        value: event.value,
      }));

    if (events.length === 0) {
      return NextResponse.json({ ok: true });
    }

    await recordProductAnalyticsEvents(events);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "analytics_failed" },
      { status: 500 },
    );
  }
}
