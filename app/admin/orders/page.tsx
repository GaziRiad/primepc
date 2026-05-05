import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getOrdersForAdmin } from "@/lib/orders";
import OrdersTable from "@/components/admin/OrdersTable";

export default async function page() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const orders = await getOrdersForAdmin();
  const safeOrders = JSON.parse(JSON.stringify(orders));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <OrdersTable orders={safeOrders} />
    </div>
  );
}
