import {
  BadgeCheck,
  MessageCircleMore,
  Rocket,
  ShieldCheck,
} from "lucide-react";

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const Features: Feature[] = [
  {
    icon: <Rocket size={32} className="stroke-primary" />,
    title: "Livraison offerte",
    description: "Pour toute commande de 40 000 DA ou plus",
  },
  {
    icon: <BadgeCheck size={32} className="stroke-primary" />,
    title: "Paiement à la livraison",
    description: "Vérifiez votre produit avant de payer",
  },
  {
    icon: <ShieldCheck size={32} className="stroke-primary" />,
    title: "Garantie de 3 mois",
    description: "Pour tous les PC et ordinateurs portables",
  },
  {
    icon: <MessageCircleMore size={32} className="stroke-primary" />,
    title: "Assistance 24h/24 et 7j/7",
    description: "Partout et à tout moment",
  },
] as const;

export default function FeaturesList() {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Features.map((feature, index) => (
        <li key={index} className="flex items-start gap-4">
          <span>{feature.icon}</span>
          <div className="flex flex-col">
            <span className="text-foreground">{feature.title}</span>
            <span className="text-sm text-zinc-500">{feature.description}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
