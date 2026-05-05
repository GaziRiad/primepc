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
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full min-w-180 text-sm">
            <thead className="bg-muted/30 text-muted-foreground">
              <tr className="text-left">
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const itemsCount = (order.items ?? []).reduce(
                  (sum: number, item: { quantity?: number }) =>
                    sum + (item.quantity ?? 0),
                  0,
                );

                return (
                  <tr key={String(order._id)} className="border-t">
                    <td className="px-6 py-4">
                      <div className="text-foreground font-medium">
                        #{String(order._id).slice(-6)}
                      </div>
                    </td>
                    <td className="text-muted-foreground px-6 py-4">
                      {itemsCount} item{itemsCount === 1 ? "" : "s"}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatDZD(order.total ?? 0)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={
                          STATUS_STYLES[order.status] ??
                          "bg-muted text-foreground"
                        }
                      >
                        {String(order.status).replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground px-6 py-4 text-xs">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
