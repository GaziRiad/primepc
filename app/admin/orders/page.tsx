import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getOrdersForAdminPage } from "@/lib/orders";
import OrdersTable from "@/components/admin/OrdersTable";
import OrdersToolbar from "@/components/admin/OrdersToolbar";
import PaginationTable from "@/components/PaginationTable";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/");
  }

  const query = await searchParams;
  const statusFilter = typeof query.status === "string" ? query.status : "all";
  const archivedFilter =
    typeof query.archived === "string" ? query.archived : "active";
  const fromDate = typeof query.from === "string" ? query.from : "";
  const search = typeof query.q === "string" ? query.q : "";
  const toDate = typeof query.to === "string" ? query.to : "";
  const sort = typeof query.sort === "string" ? query.sort : "newest";

  const {
    items: orders,
    total,
    page,
    limit,
    totalPages,
  } = await getOrdersForAdminPage(query);
  const safeOrders = JSON.parse(JSON.stringify(orders));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Orders dashboard
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Showing {start}-{end} of {total} orders.
        </p>
      </div>

      <OrdersToolbar
        key={`${statusFilter}-${archivedFilter}-${fromDate}-${toDate}-${sort}-${search}`}
        initialStatus={statusFilter}
        initialArchived={archivedFilter}
        initialFrom={fromDate}
        initialSearch={search}
        initialTo={toDate}
        initialSort={sort}
      />

      <OrdersTable
        key={`${page}-${statusFilter}-${archivedFilter}-${fromDate}-${toDate}-${sort}-${search}`}
        orders={safeOrders}
        archivedFilter={archivedFilter}
      />

      {totalPages > 1 && (
        <PaginationTable
          page={page}
          totalPages={totalPages}
          query={query}
          basePath="/admin/orders"
        />
      )}
    </div>
  );
}
