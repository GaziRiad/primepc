import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <section className="flex min-h-[62vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="bg-primary/10 text-primary mx-auto flex size-14 items-center justify-center rounded-full">
          <SearchX className="size-6" />
        </div>
        <p className="text-primary mt-6 text-xs font-semibold tracking-[0.25em] uppercase">
          Erreur 404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Cette page est introuvable.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-600">
          Le lien a peut-etre change, ou la page n&apos;existe plus.
        </p>
        <Link
          href="/"
          className="bg-primary hover:bg-primary-600 mt-8 inline-flex h-10 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition"
        >
          <ArrowLeft className="size-4" />
          Retour a l&apos;accueil
        </Link>
      </div>
    </section>
  );
}
