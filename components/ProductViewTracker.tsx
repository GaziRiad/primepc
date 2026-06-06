"use client";

import { useEffect } from "react";

import { trackProductAnalytics } from "@/lib/analyticsClient";

type ProductViewTrackerProps = {
  product: {
    coverImage?: string;
    finalPrice?: number;
    name?: string;
    slug?: string;
  };
  productId: string;
};

export default function ProductViewTracker({
  product,
  productId,
}: ProductViewTrackerProps) {
  useEffect(() => {
    if (!productId) return;

    const key = `primepc:analytics:view:${productId}`;
    try {
      if (window.sessionStorage.getItem(key) === "1") return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Session storage can be unavailable in strict privacy modes.
    }

    trackProductAnalytics({
      product,
      productId,
      type: "view",
    });
  }, [product, productId]);

  return null;
}
