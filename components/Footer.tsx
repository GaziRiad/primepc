import Link from "next/link";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";

import { SOCIAL_LINKS } from "@/lib/utils";
import LogoFooter from "./LogoFooter";

const shopLinks = [
  { label: "Tous les produits", href: "/products" },
  { label: "Nouveautés", href: "/products?sort=newest" },
  { label: "Favoris", href: "/wishlist" },
];

const companyLinks = [
  { label: "À propos", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const supportLinks = [
  { label: "Livraison et retours", href: "/delivery-returns" },
  { label: "Garantie", href: "/warranty" },
  { label: "Suivi de commande", href: "/my-account/orders" },
];

type FooterLinkGroupProps = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

function FooterLinkGroup({ title, links }: FooterLinkGroupProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold tracking-wide text-white/70 uppercase">
        {title}
      </h3>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-white/85 transition hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer>
      <div className="mx-auto overflow-hidden rounded-t-[2rem] bg-[#1847B7] text-white shadow-[0_20px_80px_rgba(24,71,183,0.24)]">
        <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-14 lg:py-12">
          <div className="flex flex-col gap-8 border-b border-white/15 pb-10 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-[0.18em] uppercase">
                Restez informé
              </span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Recevez en premier nos meilleures offres et nouveautés PC.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/75 sm:text-base">
                Abonnez-vous pour recevoir les offres exclusives, les nouveautés
                et les conseils PRIMEPC.
              </p>
            </div>

            <form className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <label htmlFor="footer-email" className="sr-only">
                Saisissez votre e-mail
              </label>
              <div className="flex-1">
                <input
                  id="footer-email"
                  type="email"
                  placeholder="Saisissez votre e-mail"
                  className="h-12 w-full rounded-xl border border-white/20 bg-white px-4 text-sm text-slate-900 transition outline-none placeholder:text-slate-500 focus:border-white focus:ring-4 focus:ring-white/20"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-900"
              >
                S’abonner
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>

          <div className="grid gap-10 py-10 lg:grid-cols-[1.2fr_repeat(3,minmax(0,1fr))] lg:gap-8">
            <div className="max-w-sm">
              <div className="[&_a_span]:text-white! [&_img]:brightness-0 [&_img]:invert">
                <LogoFooter />
              </div>

              <p className="mt-5 text-sm leading-7 text-white/78 sm:text-base">
                Ordinateurs portables, équipements gaming et accessoires
                sélectionnés pour les créateurs, les professionnels et tous les
                usages en Algérie.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-white/80">
                <li className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0" />
                  <a
                    href="mailto:support@primepc.dz"
                    className="transition hover:text-white"
                  >
                    support@primepc.dz
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="size-4 shrink-0" />
                  <a
                    href="tel:+213555000000"
                    className="transition hover:text-white"
                  >
                    +213 555 00 00 00
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="size-4 shrink-0" />
                  <span>Alger, Algérie</span>
                </li>
              </ul>
            </div>

            <FooterLinkGroup title="Boutique" links={shopLinks} />
            <FooterLinkGroup title="Entreprise" links={companyLinks} />
            <FooterLinkGroup title="Assistance" links={supportLinks} />
          </div>

          <div className="flex flex-col gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/70">
              © {new Date().getFullYear()} PRIMEPC. Tous droits réservés.
            </p>

            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:-translate-y-0.5 hover:bg-white/20"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
