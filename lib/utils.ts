import { clsx, type ClassValue } from "clsx";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DZD_FORMATTER = new Intl.NumberFormat("fr-DZ", {
  style: "currency",
  currency: "DZD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatDZD(amount: number) {
  return DZD_FORMATTER.format(amount);
}

export function getDiscountedPrice(price: number, discountPercent: number) {
  const safeDiscount = Math.min(Math.max(discountPercent, 0), 100);
  const discountedAmount = price * (safeDiscount / 100);
  return Math.round(price - discountedAmount);
}

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const WHATSAPP_NUMBER = "213555453982";
export const WHATSAPP_MESSAGE = "Hi! I have a question about PRIMEPC.";

export const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "Facebook", href: "https://instagram.com", icon: Facebook },
  { label: "TikTok", href: "https://instagram.com", icon: Instagram },
  { label: "X", href: "https://instagram.com", icon: Twitter },
  { label: "LinkedIn", href: "https://instagram.com", icon: Linkedin },
];
