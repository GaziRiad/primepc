import {
  BadgeCheck,
  MessageCircleMore,
  Rocket,
  ShieldCheck,
} from "lucide-react";

const Features = [
  {
    icon: <Rocket size={32} className="stroke-primary" />,
    title: "Free Shipping",
    description: "For all orders 40,000DA or more",
  },
  {
    icon: <BadgeCheck size={32} className="stroke-primary" />,
    title: "100% Payment on delivery",
    description: "For all orders 40,000DA or more",
  },
  {
    icon: <ShieldCheck size={32} className="stroke-primary" />,
    title: "6 months warranty",
    description: "For all PCs and laptops",
  },
  {
    icon: <MessageCircleMore size={32} className="stroke-primary" />,
    title: "24/7 Dedicated Support",
    description: "Anywhere & anytime",
  },
] as const;

export default function FeaturesList() {
  return (
    <ul className="flex items-center justify-center gap-10">
      {Features.map((feature, index) => (
        <li key={index} className="flex items-center gap-4">
          <span>{feature.icon}</span>
          <div className="flex flex-col">
            <span className="text-primary">{feature.title}</span>
            <span className="text-sm text-zinc-500">{feature.description}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
