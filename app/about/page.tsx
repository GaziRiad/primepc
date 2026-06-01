import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function AboutPage() {
  return (
    <section className="bg-white">
      <div className="relative h-[240px] w-full overflow-hidden sm:h-[320px]">
        <Image
          src="/logo-main.png"
          alt="Atelier PRIMEPC"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-900/40" />
        <div className="absolute inset-x-0 bottom-8">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 text-white">
              <span className="h-0.5 w-10 bg-white/80" />
              <p className="text-xs tracking-[0.35em] uppercase">A propos</p>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              A propos de PRIMEPC
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-xs">
              <div className="relative aspect-square h-full w-full">
                <Image
                  src="/logo-main.png"
                  alt="Setup creatif"
                  fill
                  sizes="(min-width: 1024px) 320px, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border bg-white shadow-xs sm:mt-8">
              <div className="relative aspect-square h-full w-full">
                <Image
                  src="/logo-main.png"
                  alt="Studio gaming"
                  fill
                  sizes="(min-width: 1024px) 320px, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="bg-primary h-0.5 w-10" />
              <p className="text-primary text-xs tracking-[0.3em] uppercase">
                Haute qualite
              </p>
            </div>
            <h2 className="text-foreground mt-4 text-2xl font-semibold">
              Du materiel fiable, choisi pour durer
            </h2>
            <p className="text-muted-foreground mt-4 text-sm leading-7">
              PRIMEPC propose une selection de machines et composants pour tous
              les usages : etudiants, professionnels, createurs de contenu et
              passionnes de gaming. Nous testons, expliquons et configurons pour
              que chaque client reparte avec une solution performante et simple
              a faire evoluer.
            </p>
            <p className="text-muted-foreground mt-4 text-sm leading-7">
              Notre ambition est claire : faire grandir l'industrie tech en
              Algerie, avec des choix transparents et un accompagnement humain.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="bg-primary text-primary-foreground hover:bg-primary-600 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition"
              >
                Decouvrir nos produits
              </Link>
              <Link
                href="/contact"
                className="text-foreground hover:bg-accent-100 inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-semibold transition"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="my-40 bg-[#0E0B24] py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs tracking-[0.35em] text-white/60 uppercase">
              Notre equipe
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Une equipe locale, une vision claire
            </h2>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex max-w-md flex-col items-center rounded-3xl border border-white/10 bg-white/5 px-6 py-7 text-center">
              <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/20">
                <Image
                  src="/team1.png"
                  alt="Riad Hallouch"
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
              <p className="mt-4 text-base font-semibold text-white">
                Riad Hallouch
              </p>
              <p className="text-sm text-white/70">Fondateur et gerant</p>
              <p className="mt-3 text-sm text-white/70">
                Freelance reconnu et consultant tech. Il veut rendre la
                performance accessible partout en Algerie.
              </p>
              <Link
                href="https://www.instagram.com/riad_hallouch/"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white"
              >
                Instagram
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
