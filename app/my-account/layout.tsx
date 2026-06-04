import Sidebar from "@/components/(user)/Sidebar";
import AccountBreadcrumbs from "@/components/(user)/AccountBreadcrumbs";
import { auth } from "@/lib/auth";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) return null;

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <AccountBreadcrumbs />
          <h2 className="text-accent text-2xl font-semibold">My account</h2>
        </div>
      </div>

      <section className="bg-accent-50 py-14">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 sm:px-6 lg:grid-cols-[27fr_73fr] lg:px-8">
          <Sidebar user={session.user} />

          <main className="h-full w-full rounded-xl border-[0.5px] bg-white px-4 py-6 shadow-xs sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </section>
    </div>
  );
}
