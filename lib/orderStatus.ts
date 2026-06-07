const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_confirmation: "En attente de confirmation",
  confirmed: "Confirmée",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  failed: "Échouée",
};

export function getOrderStatusLabel(status: unknown) {
  const value = String(status ?? "").trim();
  if (!value) return "Inconnu";

  return ORDER_STATUS_LABELS[value] ?? value.replace(/_/g, " ");
}
