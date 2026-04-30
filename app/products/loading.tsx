export default function Loading() {
  return (
    <div>
      <div className="mx-auto max-w-7xl py-8">
        <div className="h-7 w-60 animate-pulse rounded bg-zinc-200" />
      </div>

      <section className="bg-accent-50 py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-[27fr_73fr] gap-8">
          <div className="flex flex-col gap-5 text-sm">
            <div className="h-12 animate-pulse rounded-xl border-[0.5px] bg-white shadow-xs" />
            <div className="animate-pulse rounded-xl border-[0.5px] bg-white shadow-xs">
              <div className="h-12 border-b" />
              <div className="space-y-3 px-5 py-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-4 rounded bg-zinc-200" />
                ))}
              </div>
            </div>
            <div className="animate-pulse rounded-xl border-[0.5px] bg-white shadow-xs">
              <div className="h-12 border-b" />
              <div className="space-y-3 px-5 py-6">
                <div className="h-4 rounded bg-zinc-200" />
                <div className="h-4 rounded bg-zinc-200" />
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between rounded-xl border-[0.5px] bg-white px-5 py-3 shadow-xs">
              <div className="h-8 w-36 animate-pulse rounded bg-zinc-200" />
              <div className="h-4 w-44 animate-pulse rounded bg-zinc-200" />
            </div>

            <div className="flex flex-col py-3 shadow-xs">
              <ul className="grid flex-1 grid-cols-4 content-start gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <li
                    key={index}
                    className="rounded-sm border bg-white p-4"
                  >
                    <div className="aspect-square w-full animate-pulse rounded bg-zinc-200" />
                    <div className="mt-4 h-3 w-3/4 animate-pulse rounded bg-zinc-200" />
                    <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-zinc-200" />
                    <div className="mt-4 h-8 w-full animate-pulse rounded bg-zinc-200" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
