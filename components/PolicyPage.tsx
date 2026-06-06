import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, MessageCircleMore } from "lucide-react";

import Breadcrumbs from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";

type PolicyCard = {
  description: string;
  icon: LucideIcon;
  title: string;
};

type PolicySection = {
  description?: string;
  items?: string[];
  title: string;
};

type PolicyPageProps = {
  aside?: ReactNode;
  cards: PolicyCard[];
  compact?: boolean;
  description: string;
  eyebrow: string;
  lastUpdated?: string;
  relatedLinks?: Array<{
    description: string;
    href: string;
    label: string;
  }>;
  sections: PolicySection[];
  title: string;
};

export default function PolicyPage({
  aside,
  cards,
  compact = false,
  description,
  eyebrow,
  lastUpdated = "05 juin 2026",
  relatedLinks = [],
  sections,
  title,
}: PolicyPageProps) {
  return (
    <main className="bg-accent-50 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
      </div>

      <section className="bg-primary text-white">
        <div
          className={cn(
            "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
            compact ? "py-10 lg:py-12" : "py-14 lg:py-18",
          )}
        >
          <p className="text-xs font-semibold tracking-[0.28em] text-white/70 uppercase">
            {eyebrow}
          </p>
          <div className="mt-4 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-base leading-8 text-white/82 sm:text-lg">
              {description}
            </p>
          </div>
          <p className="mt-8 text-sm text-white/68">
            Derniere mise a jour : {lastUpdated}
          </p>
        </div>
      </section>

      <section
        className={cn(
          "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8",
          compact ? "py-8 lg:py-10" : "py-10 lg:py-14",
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ description: cardDescription, icon: Icon, title }) => (
            <article
              key={title}
              className="rounded-2xl border bg-white p-5 shadow-xs"
            >
              <span className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
                <Icon className="size-5" />
              </span>
              <h2 className="text-foreground mt-4 text-base font-semibold">
                {title}
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                {cardDescription}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div className="space-y-5">
            {sections.map((section, index) => (
              <article
                key={section.title}
                className="rounded-2xl border bg-white p-6 shadow-xs sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <span className="bg-accent-100 text-primary flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h2 className="text-foreground text-xl font-semibold">
                      {section.title}
                    </h2>
                    {section.description && (
                      <p className="text-muted-foreground mt-3 text-sm leading-7 sm:text-base">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>

                {section.items && section.items.length > 0 && (
                  <ul className="mt-5 space-y-3 pl-13">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="text-muted-foreground flex gap-3 text-sm leading-7 sm:text-base"
                      >
                        <span className="bg-primary mt-2.5 size-1.5 shrink-0 rounded-full" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-2xl border bg-white p-6 shadow-xs">
              <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                <MessageCircleMore className="size-5" />
              </span>
              <h2 className="text-foreground mt-4 text-lg font-semibold">
                Besoin d&apos;aide ?
              </h2>
              <p className="text-muted-foreground mt-2 text-sm leading-6">
                Notre equipe peut confirmer les details de votre commande, de
                la livraison ou de la garantie avant votre achat.
              </p>
              <div className="mt-5 grid gap-3">
                <Link
                  href="/contact"
                  className="bg-primary text-primary-foreground hover:bg-primary-600 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition"
                >
                  Nous contacter
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/products"
                  className="text-foreground hover:bg-accent-100 inline-flex items-center justify-center rounded-full border px-5 py-3 text-sm font-semibold transition"
                >
                  Voir les produits
                </Link>
              </div>
            </div>

            <div
              className={cn(
                "mt-5 rounded-2xl border border-primary/10 bg-white p-6 shadow-xs",
                !aside && "hidden",
              )}
            >
              {aside}
            </div>
          </aside>
        </div>

        {relatedLinks.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <p className="text-primary text-sm font-semibold">
                  {link.label}
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  {link.description}
                </p>
                <span className="text-foreground mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Ouvrir la page
                  <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
