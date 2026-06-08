import type { Metadata } from "next";
import { Database, Eye, LockKeyhole, UserCheck } from "lucide-react";

import PolicyPage from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Politique de confidentialite",
  description:
    "Politique de confidentialite et traitement des donnees par PRIMEPC.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      compact
      eyebrow="Protection des donnees"
      title="Politique de confidentialite"
      description="PRIMEPC utilise uniquement les donnees necessaires pour fournir le site, traiter les commandes, securiser les comptes et repondre aux demandes."
      cards={[
        {
          icon: Database,
          title: "Donnees utiles",
          description:
            "Coordonnees, adresse, commandes et informations techniques necessaires au service.",
        },
        {
          icon: LockKeyhole,
          title: "Acces protege",
          description:
            "Les acces administratifs et les mots de passe sont proteges par des controles adaptes.",
        },
        {
          icon: Eye,
          title: "Usage transparent",
          description:
            "Les donnees servent au traitement des commandes, au support et a la securite.",
        },
        {
          icon: UserCheck,
          title: "Vos choix",
          description:
            "Vous pouvez demander l'acces, la correction ou la suppression de vos donnees.",
        },
      ]}
      sections={[
        {
          title: "Donnees collectees",
          items: [
            "Informations de compte et de connexion, notamment nom, adresse e-mail et fournisseur de connexion.",
            "Informations de commande et de livraison, notamment telephone, adresse, commune, produits et historique.",
            "Messages envoyes au support et donnees techniques limitees utilisees pour la securite, la mesure d'audience et la prevention des abus.",
          ],
        },
        {
          title: "Pourquoi nous les utilisons",
          items: [
            "Creer et securiser votre compte, traiter vos commandes et assurer le service apres-vente.",
            "Envoyer les confirmations et rappels deja proposes par le service.",
            "Detecter les erreurs, limiter les abus et ameliorer les performances du site.",
          ],
        },
        {
          title: "Partage et conservation",
          items: [
            "Les donnees peuvent etre transmises aux prestataires strictement necessaires, par exemple l'hebergement, la livraison, l'authentification et l'envoi d'e-mails.",
            "PRIMEPC ne vend pas vos donnees personnelles.",
            "Les donnees sont conservees pendant la duree necessaire au service, aux obligations applicables et a la resolution des litiges.",
          ],
        },
        {
          title: "Vos droits et contact",
          items: [
            "Vous pouvez demander une copie, une correction ou une suppression des donnees associees a votre compte.",
            "Certaines informations de commande peuvent devoir etre conservees pour le suivi commercial ou les obligations applicables.",
            "Utilisez la page Contact pour toute demande relative a vos donnees personnelles.",
          ],
        },
      ]}
      relatedLinks={[
        {
          href: "/terms",
          label: "Conditions d'utilisation",
          description: "Consultez les regles applicables au site et aux achats.",
        },
        {
          href: "/contact",
          label: "Nous contacter",
          description: "Envoyez une demande relative a vos donnees.",
        },
      ]}
    />
  );
}
