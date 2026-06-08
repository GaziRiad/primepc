import type { Metadata } from "next";
import { Banknote, FileCheck2, PackageCheck, ShieldCheck } from "lucide-react";

import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description:
    "Conditions applicables a l'utilisation du site et aux commandes PRIMEPC.",
};

export default function TermsPage() {
  return (
    <PolicyPage
      compact
      eyebrow="Informations legales"
      title="Conditions d'utilisation"
      description="Ces conditions expliquent les regles applicables a l'utilisation du site PRIMEPC et aux commandes passees en Algerie."
      cards={[
        {
          icon: FileCheck2,
          title: "Informations claires",
          description:
            "Les caracteristiques, prix et disponibilites sont confirmes avant expedition.",
        },
        {
          icon: Banknote,
          title: "Paiement a la livraison",
          description:
            "Le montant final et les frais eventuels sont affiches avant la commande.",
        },
        {
          icon: PackageCheck,
          title: "Commande confirmee",
          description:
            "PRIMEPC peut contacter le client pour verifier les informations de livraison.",
        },
        {
          icon: ShieldCheck,
          title: "Assistance",
          description:
            "Les conditions de retour et de garantie restent accessibles avant l'achat.",
        },
      ]}
      sections={[
        {
          title: "Utilisation du site",
          items: [
            "Vous devez fournir des informations exactes lorsque vous creez un compte, contactez PRIMEPC ou passez une commande.",
            "Toute utilisation frauduleuse, automatisation abusive ou tentative d'acces non autorise est interdite.",
            "Les contenus, marques, images et elements du site ne peuvent pas etre reutilises sans autorisation.",
          ],
        },
        {
          title: "Produits, prix et disponibilite",
          items: [
            "Les prix sont indiques en dinars algeriens et peuvent evoluer avant la validation d'une commande.",
            "Une commande peut etre refusee ou annulee si le produit devient indisponible, si les coordonnees sont invalides ou en cas d'erreur manifeste.",
            "Les photos illustrent les produits; les informations confirmees dans la fiche produit et par notre equipe font reference.",
          ],
        },
        {
          title: "Commandes et livraison",
          items: [
            "Le paiement s'effectue a la livraison sauf accord different confirme par PRIMEPC.",
            "Le client doit rester joignable et fournir une adresse permettant la livraison.",
            "Les conditions detaillees de livraison, verification et retour figurent sur la page Livraison et retours.",
          ],
        },
        {
          title: "Comptes et responsabilite",
          items: [
            "Vous etes responsable de la confidentialite de vos moyens de connexion.",
            "PRIMEPC peut suspendre un compte ou une commande en cas de fraude, d'abus ou de risque de securite.",
            "Pour toute question ou contestation, contactez-nous afin que nous puissions examiner la situation.",
          ],
        },
      ]}
      relatedLinks={[
        {
          href: "/delivery-returns",
          label: "Livraison et retours",
          description: "Consultez les conditions de livraison et de retour.",
        },
        {
          href: "/privacy",
          label: "Confidentialite",
          description: "Comprenez comment vos donnees sont utilisees.",
        },
      ]}
    />
  );
}
