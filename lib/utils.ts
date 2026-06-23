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

export function getDiscountPercentFromFinalPrice(
  price: number,
  finalPrice: number,
) {
  if (!Number.isFinite(price) || price <= 0) return 0;
  if (!Number.isFinite(finalPrice)) return 0;

  const boundedFinalPrice = Math.min(Math.max(finalPrice, 0), price);
  const discount = ((price - boundedFinalPrice) / price) * 100;
  return Number(discount.toFixed(4));
}

export function getDisplayDiscountPercent(discountPercent: number) {
  if (!Number.isFinite(discountPercent) || discountPercent <= 0) return 0;

  const safeDiscount = Math.min(Math.max(discountPercent, 0), 100);
  if (safeDiscount < 1) return 0;
  if (safeDiscount < 10) return Math.floor(safeDiscount);

  return Math.floor(safeDiscount / 5) * 5;
}

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const WHATSAPP_NUMBER = "213555453982";
export const WHATSAPP_MESSAGE = "Hi! I have a question about PRIMEPC.";
export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ||
  "https://www.instagram.com/riad_hallouch/";
export const FACEBOOK_URL =
  process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK ||
  "https://www.facebook.com/profile.php?id=61590728039391";

export const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: INSTAGRAM_URL,
    icon: Instagram,
  },
  {
    label: "Facebook",
    href: FACEBOOK_URL,
    icon: Facebook,
  },
  {
    label: "TikTok",
    href: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK || "",
    icon: Instagram,
  },
  {
    label: "X",
    href: process.env.NEXT_PUBLIC_SOCIAL_X || "",
    icon: Twitter,
  },
  {
    label: "LinkedIn",
    href: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "",
    icon: Linkedin,
  },
].filter((link) => link.href);
