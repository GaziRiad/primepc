import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Cpu, ShieldCheck, Wrench } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Retrouvez prochainement les guides, conseils pratiques et recommandations PRIMEPC.",
};

const upcomingTopics = [
  {
    icon: Cpu,
    title: "Guides d'achat",
    description: "Des choix clairs selon votre usage et votre budget.",
  },
  {
    icon: Wrench,
    title: "Conseils pratiques",
    description: "Entretien, configuration et astuces pour votre materiel.",
  },
  {
    icon: ShieldCheck,
    title: "Expertise PRIMEPC",
    description: "Nos recommandations pour acheter sereinement.",
  },
];

export default function BlogsPage() {
  return (
    <div className="bg-white">
      <section className="relative isolate min-h-[520px] overflow-hidden bg-[#0e0b24]">
        <div className="absolute inset-y-0 right-0 hidden w-[52%] lg:block">
          <Image
            src="/images/gaming.png"
            alt="Ordinateur portable gaming PRIMEPC"
            fill
            priority
            sizes="52vw"
            className="object-contain object-center drop-shadow-[0_30px_45px_rgba(0,0,0,0.45)]"
          />
        </div>

        <div className="relative mx-auto flex min-h-[520px] max-w-6xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-white/60">
              <BookOpen className="size-4" />
              <p className="text-xs font-semibold tracking-[0.25em] uppercase">
                Le journal PRIMEPC
              </p>
            </div>

            <h1 className="mt-6 text-4xl font-semibold text-white sm:text-5xl">
              Notre blog est en cours de preparation.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/70">
              Nous preparons des guides utiles, des conseils d&apos;entretien et
              des explications simples pour vous aider a choisir et profiter
              pleinement de votre materiel.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/products"
                className="bg-primary hover:bg-primary-600 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-white transition"
              >
                Decouvrir nos produits
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center rounded-full border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-white">
        <div className="mx-auto grid max-w-6xl divide-y px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {upcomingTopics.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4 py-8 md:px-6 md:first:pl-0">
              <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                <Icon className="size-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-950">
                  {title}
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
