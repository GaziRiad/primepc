import type { Metadata } from "next";
import { BadgeCheck, FileCheck2, ShieldCheck, Wrench } from "lucide-react";

import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Garantie 3 mois",
  description:
    "Consultez les conditions de garantie PRIMEPC pour les laptops et PC vendus en Algerie.",
};

export default function WarrantyPage() {
  return (
    <PolicyPage
      eyebrow="Garantie PRIMEPC"
      title="Garantie 3 mois"
      description="Chaque laptop vendu par PRIMEPC est couvert par une garantie de 3 mois contre les problemes materiels non causes par une mauvaise utilisation. Notre objectif est simple : vous vendre une machine fiable, testee, et rester disponibles si un vrai probleme apparait."
      cards={[
        {
          icon: ShieldCheck,
          title: "3 mois de couverture",
          description:
            "La garantie commence a la date de livraison ou de recuperation du produit.",
        },
        {
          icon: BadgeCheck,
          title: "Produit teste",
          description:
            "Les machines sont verifiees avant livraison pour reduire les mauvaises surprises.",
        },
        {
          icon: Wrench,
          title: "Diagnostic serieux",
          description:
            "Chaque demande est inspectee avant validation de la solution adaptee.",
        },
        {
          icon: FileCheck2,
          title: "Preuve de commande",
          description:
            "Gardez votre numero de commande et les accessoires inclus avec le produit.",
        },
      ]}
      sections={[
        {
          title: "Ce que la garantie couvre",
          description:
            "La garantie couvre les defauts materiels constates pendant la periode de garantie, lorsque le produit a ete utilise normalement.",
          items: [
            "Probleme materiel interne qui n'est pas cause par un choc, un liquide, une surtension ou une mauvaise utilisation.",
            "Diagnostic par notre equipe afin de confirmer la source du probleme.",
            "Reparation, remplacement de la piece concernee, echange ou solution commerciale selon le cas et la disponibilite.",
            "Accompagnement apres-vente pour vous expliquer la marche a suivre et les delais.",
          ],
        },
        {
          title: "Ce que la garantie ne couvre pas",
          description:
            "Certains problemes ne peuvent pas etre pris en charge, car ils dependent de l'utilisation ou de l'environnement du client.",
          items: [
            "Chute, choc, casse, rayures importantes, ecran fissure ou charniere endommagee apres livraison.",
            "Contact avec un liquide, humidite, oxydation ou stockage dans un environnement inapproprie.",
            "Probleme electrique externe : surtension, prise defectueuse, installation electrique instable, chargeur non adapte ou mauvaise methode de charge.",
            "Ouverture, reparation ou modification du produit par une personne non autorisee par PRIMEPC.",
            "Problemes logiciels : virus, systeme corrompu, mot de passe oublie, perte de donnees, installation de pilotes ou de logiciels non compatibles.",
            "Usure normale des consommables, notamment batterie, clavier, touchpad ou chargeur, sauf defaut clair constate au moment de la livraison.",
          ],
        },
        {
          title: "Comment demander la garantie",
          items: [
            "Contactez-nous avec votre numero de commande, votre nom complet, votre numero de telephone et une description claire du probleme.",
            "Envoyez des photos ou une courte video si le probleme est visible.",
            "Notre equipe vous indique si le produit doit etre depose ou renvoye pour diagnostic.",
            "Sauvegardez vos donnees avant tout depot : PRIMEPC ne peut pas garantir la conservation des fichiers pendant une intervention.",
            "La solution finale est confirmee apres inspection du produit.",
          ],
        },
        {
          title: "Regle importante",
          description:
            "La garantie est faite pour proteger les clients contre les vrais defauts materiels. Elle ne remplace pas une assurance contre les accidents, les chocs, les problemes electriques a domicile ou les mauvaises manipulations.",
        },
      ]}
      aside={
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
            A garder
          </p>
          <h3 className="text-foreground mt-3 text-base font-semibold">
            Avant de nous envoyer un produit
          </h3>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Retirez vos mots de passe si possible, sauvegardez vos fichiers et
            gardez le chargeur avec la machine lorsque notre equipe le demande.
          </p>
        </div>
      }
      relatedLinks={[
        {
          href: "/delivery-returns",
          label: "Livraison et retours",
          description:
            "Voir les conditions de livraison Yalidine, paiement a la reception, retours sous 3 jours et giveaway mensuel.",
        },
      ]}
    />
  );
}
