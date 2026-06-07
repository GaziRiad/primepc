import { Suspense } from "react";
import NewArrivalsList from "./NewArrivalsList";
import { Spinner } from "./ui/spinner";
import Link from "next/link";

export default async function NewArrivals() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-foreground text-2xl font-semibold capitalize">
          Nouveautés
        </h2>

        <Link
          href="/products"
          className="hover:bg-primary cursor-pointer rounded-full border bg-zinc-100 px-4 py-2 text-sm text-black transition-all hover:text-white"
        >
          tout voir
        </Link>
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
