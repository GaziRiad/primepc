import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Home,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Commande confirmée",
  description: "Confirmation de commande PRIMEPC.",
  robots: {
    follow: false,
    index: false,
  },
};

type ThankYouPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getParam = (
  params: Record<string, string | string[] | undefined>,
  key: string,
) => {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
};

const getSafeOrderNumber = (value?: string) =>
  String(value ?? "")
    .trim()
    .replace(/[^\w-]/g, "")
    .slice(0, 64);

export default async function ThankYouPage({
  searchParams,
}: ThankYouPageProps) {
  const params = searchParams ? await searchParams : {};
  const orderNumber = getSafeOrderNumber(getParam(params, "order"));
  const shortOrderNumber = orderNumber ? orderNumber.slice(-6) : "";

  return (
    <main className="bg-accent-50">
      <section className="mx-auto flex min-h-[68vh] max-w-5xl items-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-2 w-full rounded-[1.75rem] border bg-white p-6 shadow-sm duration-500 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircle2 className="size-6" />
              </div>

              <p className="text-primary mt-6 text-xs font-semibold tracking-[0.22em] uppercase">
                Commande confirmée
              </p>
              <h1 className="text-foreground mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Merci, votre commande est bien reçue.
              </h1>
              <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7">
                Notre équipe va vérifier les informations et vous contacter si
                une confirmation est nécessaire avant la livraison.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-11 rounded-full px-5">
                  <Link href="/products">
                    Continuer mes achats
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-full px-5"
                >
                  <Link href="/my-account/orders">
                    Voir mes commandes
                    <ShoppingBag className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="rounded-2xl border bg-slate-50 p-5">
              {shortOrderNumber ? (
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase">
                    Référence
                  </p>
                  <p className="text-foreground mt-2 font-mono text-2xl font-semibold">
                    #{shortOrderNumber}
                  </p>
                </div>
              ) : null}

              <div className={shortOrderNumber ? "mt-5 border-t pt-5" : ""}>
                <p className="text-foreground text-sm font-semibold">
                  Paiement à la livraison
                </p>
                <p className="text-muted-foreground mt-2 text-sm leading-6">
                  Vous payez uniquement lorsque la commande arrive.
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button asChild variant="ghost" className="justify-start px-0">
                  <Link href="/contact">
                    <MessageCircle className="size-4" />
                    Nous contacter
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="justify-start px-0">
                  <Link href="/">
                    <Home className="size-4" />
                    Retour à l&apos;accueil
                  </Link>
                </Button>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
