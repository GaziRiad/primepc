import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import AdminTabs from "@/components/admin/AdminTabs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <section className="bg-accent-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-accent-500 text-xs tracking-[0.2em] uppercase">
              Admin
            </p>
            <h1 className="text-foreground mt-2 text-2xl font-semibold">
              Control Center
            </h1>
          </div>

          <AdminTabs />

          {children}
        </div>
      </div>
    </section>
  );
}
