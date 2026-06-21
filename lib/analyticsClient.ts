"use client";

import {
  trackMetaPixel,
  type MetaPixelContent,
} from "@/lib/metaPixel";

type ProductAnalyticsClientEvent = {
  product?: {
    coverImage?: string;
    finalPrice?: number;
    name?: string;
    slug?: string;
  };
  productId: string;
  quantity?: number;
  type: "view" | "add_to_cart" | "checkout_start";
  value?: number;
};

const ANALYTICS_ENDPOINT = "/api/analytics/product";
const META_PIXEL_CURRENCY = "DZD";

const getEventUnitPrice = (event: ProductAnalyticsClientEvent) => {
  const value = Number(event.value ?? event.product?.finalPrice ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

const getEventQuantity = (event: ProductAnalyticsClientEvent) => {
  const quantity = Number(event.quantity ?? 1);
  return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
};

const buildMetaContent = (
  event: ProductAnalyticsClientEvent,
): MetaPixelContent => ({
  id: event.productId,
  item_price: getEventUnitPrice(event),
  quantity: getEventQuantity(event),
});

const trackMetaProductAnalytics = (
  events: ProductAnalyticsClientEvent[],
) => {
  const checkoutEvents = events.filter(
    (event) => event.type === "checkout_start" && event.productId,
  );

  if (checkoutEvents.length > 0) {
    const contents = checkoutEvents.map(buildMetaContent);
    const value = checkoutEvents.reduce(
      (total, event) =>
        total + getEventUnitPrice(event) * getEventQuantity(event),
      0,
    );
    const numItems = checkoutEvents.reduce(
      (total, event) => total + getEventQuantity(event),
      0,
    );

    trackMetaPixel("InitiateCheckout", {
      content_ids: contents.map((content) => content.id),
      content_type: "product",
      contents,
      currency: META_PIXEL_CURRENCY,
      num_items: numItems,
      value,
    });
  }

  for (const event of events) {
    if (!event.productId || event.type === "checkout_start") continue;

    const content = buildMetaContent(event);
    const parameters = {
      content_ids: [content.id],
      content_name: event.product?.name,
      content_type: "product",
      contents: [content],
      currency: META_PIXEL_CURRENCY,
      value: getEventUnitPrice(event) * getEventQuantity(event),
    };

    if (event.type === "view") {
      trackMetaPixel("ViewContent", parameters);
    }

    if (event.type === "add_to_cart") {
      trackMetaPixel("AddToCart", parameters);
    }
  }
};

export const trackProductAnalytics = (
  events: ProductAnalyticsClientEvent | ProductAnalyticsClientEvent[],
) => {
  if (typeof window === "undefined") return;

  const normalizedEvents = Array.isArray(events) ? events : [events];
  trackMetaProductAnalytics(normalizedEvents);

  const payload = JSON.stringify({
    events: normalizedEvents,
  });

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    const queued = navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    if (queued) return;
  }

  void fetch(ANALYTICS_ENDPOINT, {
    body: payload,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    method: "POST",
  }).catch(() => null);
};
