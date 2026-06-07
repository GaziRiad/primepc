"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, TriangleAlert } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[62vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-full">
          <TriangleAlert className="size-6" />
        </div>
        <p className="text-primary mt-6 text-xs font-semibold tracking-[0.25em] uppercase">
          Une petite interruption
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Cette page n&apos;a pas pu se charger.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-600">
          Vos informations sont en securite. Vous pouvez reessayer maintenant ou
          revenir a l&apos;accueil.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="bg-primary hover:bg-primary-600 inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition"
          >
            <RefreshCw className="size-4" />
            Reessayer
          </button>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            <ArrowLeft className="size-4" />
            Retour a l&apos;accueil
          </Link>
        </div>
      </div>
    </section>
  );
}
