import Sidebar from "@/components/(user)/Sidebar";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="">
      <div className="mx-auto max-w-7xl py-8">
        <h2 className="text-accent text-2xl font-semibold">My account</h2>
      </div>

      <section className="bg-accent-50 h-180 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-[27fr_73fr] gap-8">
          <Sidebar />

          <main className="h-full w-full rounded-xl border-[0.5px] bg-white px-8 py-6 shadow-xs">
            {children}
          </main>
        </div>
      </section>
    </div>
  );
}
