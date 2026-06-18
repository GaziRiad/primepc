import type { Metadata } from "next";
import {
  CalendarDays,
  Gift,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";

import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Livraison et retours",
  description:
    "Livraison PRIMEPC avec Yalidine, paiement a la reception, verification avant paiement, retours sous 3 jours et giveaway mensuel.",
};

export default function DeliveryReturnsPage() {
  return (
    <PolicyPage
      compact
      eyebrow="Livraison et retours"
      title="Livraison, paiement et retours"
      description="Payez a la reception avec Yalidine, verifiez votre produit avant paiement, profitez de la livraison offerte des 40,000 DA et testez votre achat pendant 3 jours."
      cards={[
        {
          icon: Truck,
          title: "Yalidine",
          description:
            "Livraison avec paiement a la reception partout ou le service est disponible.",
        },
        {
          icon: PackageCheck,
          title: "Verification",
          description:
            "Vous pouvez verifier le produit devant le livreur avant de payer.",
        },
        {
          icon: RotateCcw,
          title: "3 jours de test",
          description:
            "Retour possible si le produit est intact, complet et dans les delais.",
        },
        {
          icon: Gift,
          title: "Giveaway mensuel",
          description:
            "Les commandes valides du mois precedent participent au tirage.",
        },
      ]}
      sections={[
        {
          title: "Livraison et paiement",
          description:
            "PRIMEPC livre avec Yalidine. Le paiement se fait a la reception, apres verification rapide du produit.",
          items: [
            "La livraison est offerte pour toute commande de 40,000 DA ou plus.",
            "Pour les commandes inferieures a 40,000 DA, les frais sont affiches ou confirmes avant validation.",
            "Notre equipe peut vous contacter avant expedition pour confirmer le telephone, la wilaya, la commune et l'adresse.",
            "Les delais dependent de la wilaya, des jours ouvrables et de la disponibilite du service de livraison.",
          ],
        },
        {
          title: "Verification avant paiement",
          description:
            "Avant de payer le livreur, vous pouvez verifier que le produit correspond bien a votre commande.",
          items: [
            "Controlez le modele, l'etat general, le chargeur et les accessoires inclus.",
            "Si un probleme visible existe a la reception, contactez PRIMEPC immediatement.",
            "Cette verification doit rester raisonnable et respecter le temps du livreur.",
          ],
        },
        {
          title: "Retour sous 3 jours",
          description:
            "Apres reception, vous avez 3 jours pour tester le produit. Si vous ne l'aimez pas ou si vous constatez un probleme, vous pouvez demander un retour.",
          items: [
            "Le produit doit etre intact, propre, complet et sans dommage cause par l'utilisateur.",
            "Les accessoires inclus doivent etre retournes avec le produit.",
            "Le produit ne doit pas etre bloque par un mot de passe ou un compte qui empeche la verification.",
            "Les frais de retour eventuels sont confirmes avec vous avant l'enlevement ou le depot, sauf probleme confirme du cote PRIMEPC.",
            "Remboursement, echange ou autre solution sont confirmes apres inspection du produit retourne.",
          ],
        },
        {
          title: "Giveaway mensuel",
          description:
            "Chaque mois, PRIMEPC organise un giveaway pour remercier les clients du mois precedent. Le cadeau est un produit choisi par notre equipe.",
          items: [
            "Le giveaway commence le 1er jour de chaque mois.",
            "Les commandes annulees, refusees ou retournees ne sont pas eligibles.",
            "Le gagnant est choisi de maniere aleatoire parmi les commandes eligibles.",
            "Le resultat est partage sur nos reseaux sociaux et le gagnant est contacte par PRIMEPC.",
          ],
        },
      ]}
      aside={
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
            A retenir
          </p>
          <h3 className="text-foreground mt-3 text-base font-semibold">
            Livraison offerte des 40,000 DA
          </h3>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Les commandes validees peuvent aussi participer au giveaway mensuel
            PRIMEPC.
          </p>
          <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
            <CalendarDays className="text-primary size-4" />
            Tirage partage sur nos reseaux sociaux.
          </div>
        </div>
      }
      relatedLinks={[
        {
          href: "/warranty",
          label: "Garantie 3 mois",
          description:
            "Consultez les conditions de garantie appliquees aux laptops et PC PRIMEPC.",
        },
      ]}
    />
  );
}
