import { Suspense } from "react";
import NewArrivalsList from "./NewArrivalsList";
import { Spinner } from "./ui/spinner";
import Link from "next/link";

export default async function NewArrivals() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-6 rounded-2xl border bg-white/90 px-4 py-4 shadow-xs sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-primary-600 text-xs font-semibold tracking-[0.2em] uppercase">
              Fresh drop
            </p>
            <h2 className="text-foreground mt-2 text-2xl font-semibold">
              New Arrivals
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Latest PCs, laptops, and accessories added this week.
            </p>
          </div>

          <Link
            href="/products"
            className="bg-primary-800 hover:bg-primary-700 inline-flex w-full items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold text-white transition sm:w-auto"
          >
            View all
          </Link>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="flex min-h-[40vh] items-center justify-center">
            <Spinner className="size-8" />
          </div>
        }
      >
        <NewArrivalsList />
      </Suspense>
    </section>
  );
}
