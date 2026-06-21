"use client";

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "2143984936474692";

export type MetaPixelEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase";

export type MetaPixelContent = {
  id: string;
  item_price?: number;
  quantity?: number;
};

type MetaPixelParameters = Record<
  string,
  | string
  | number
  | boolean
  | MetaPixelContent[]
  | string[]
  | number[]
  | undefined
>;

type MetaPixelOptions = {
  eventID?: string;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const trackMetaPixel = (
  eventName: MetaPixelEventName,
  parameters?: MetaPixelParameters,
  options?: MetaPixelOptions,
) => {
  if (typeof window === "undefined" || !META_PIXEL_ID || !window.fbq) return;

  window.fbq("track", eventName, parameters, options);
};
