import { auth } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/orders";
import { Badge } from "@/components/ui/badge";
import { formatDZD } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending_confirmation: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  failed: "bg-slate-200 text-slate-700",
};

export default async function page() {
  const session = await auth();

  if (!session?.user?.id) return null;

  const orders = await getOrdersForUser(session.user.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground text-lg font-semibold">Your Orders</h3>
        <p className="text-muted-foreground text-sm">
          Track your latest purchases and delivery status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed px-6 py-10 text-center text-sm">
          You have no orders yet.
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {orders.map((order) => {
              const itemsCount = (order.items ?? []).reduce(
                (sum: number, item: { quantity?: number }) =>
                  sum + (item.quantity ?? 0),
                0,
              );
              const orderId = String(order._id);
              const statusLabel = String(order.status).replace(/_/g, " ");

              return (
                <div
                  key={orderId}
                  className="rounded-xl border bg-white p-4 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-foreground text-sm font-semibold">
                        Order #{orderId.slice(-6)}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge
                      className={
                        STATUS_STYLES[order.status] ??
                        "bg-muted text-foreground"
                      }
                    >
                      {statusLabel}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Items</p>
                      <p className="text-foreground font-medium">
                        {itemsCount} item{itemsCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Total</p>
                      <p className="text-foreground font-semibold">
                        {formatDZD(order.total ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
