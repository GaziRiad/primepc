"use client";

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

export const trackProductAnalytics = (
  events: ProductAnalyticsClientEvent | ProductAnalyticsClientEvent[],
) => {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({
    events: Array.isArray(events) ? events : [events],
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
