export const DELIVERY_METHODS = [
  {
    value: "home",
    label: "À domicile",
    description: "Livraison a votre adresse.",
  },
  {
    value: "stop_desk",
    label: "Stop Desk",
    description: "Retrait au bureau de livraison disponible dans votre wilaya.",
  },
] as const;

export type DeliveryMethod = (typeof DELIVERY_METHODS)[number]["value"];

export const DELIVERY_FEES: Record<DeliveryMethod, number> = {
  home: 600,
  stop_desk: 0,
};

export const DEFAULT_DELIVERY_METHOD: DeliveryMethod = "home";

export const isDeliveryMethod = (value: unknown): value is DeliveryMethod =>
  DELIVERY_METHODS.some((method) => method.value === value);

export const normalizeDeliveryMethod = (value: unknown) => {
  const method = String(value ?? "").trim();
  if (!method) return DEFAULT_DELIVERY_METHOD;
  return isDeliveryMethod(method) ? method : "";
};

export const getDeliveryMethodLabel = (value: unknown) =>
  DELIVERY_METHODS.find((method) => method.value === value)?.label ??
  DELIVERY_METHODS.find((method) => method.value === DEFAULT_DELIVERY_METHOD)
    ?.label ??
  "À domicile";

export const getDeliveryFee = (value: unknown) => {
  const method = normalizeDeliveryMethod(value);
  return method ? DELIVERY_FEES[method] ?? 0 : 0;
};
