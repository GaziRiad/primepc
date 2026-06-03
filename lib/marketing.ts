import "server-only";

import { cache } from "react";

import startDbConnection from "@/lib/db";
import MarketingSettings from "@/models/MarketingSettings";
import type {
  MarketingBanner,
  MarketingSettingsData,
  SpecialDealSettings,
} from "@/types/marketing";

export const DEFAULT_MARKETING_SETTINGS: MarketingSettingsData = {
  banners: [
    {
      image: "/images/marketing1.jpg",
      alt: "Featured PRIMEPC setup deal",
      href: "/products",
      isActive: true,
    },
    {
      image: "/images/marketing2.jpg",
      alt: "PRIMEPC laptop and accessories promotion",
      href: "/products",
      isActive: true,
    },
    {
      image: "/images/marketing3.jpg",
      alt: "PRIMEPC gaming and workspace promotion",
      href: "/products",
      isActive: true,
    },
  ],
  specialDeal: {
    enabled: true,
    eyebrow: "Don't Miss!!",
    title: "Enhance Your Work Experience",
    subtitle: "Work and gaming setup deals",
    image: "/images/sutdy.png",
    href: "/products?sort=-discount",
    ctaLabel: "Check it out!",
    endsAt: "2026-12-31T22:59:59Z",
  },
};

const normalizeBanner = (banner: Partial<MarketingBanner>): MarketingBanner => ({
  image: String(banner.image ?? "").trim(),
  alt: String(banner.alt ?? "").trim() || "PRIMEPC marketing banner",
  href: String(banner.href ?? "").trim(),
  isActive: banner.isActive !== false,
});

const normalizeDeal = (
  deal: Partial<SpecialDealSettings> | null | undefined,
): SpecialDealSettings => {
  const fallback = DEFAULT_MARKETING_SETTINGS.specialDeal;
  const rawDate = deal?.endsAt ? new Date(deal.endsAt) : new Date(fallback.endsAt);

  return {
    enabled: deal?.enabled !== false,
    eyebrow: String(deal?.eyebrow ?? fallback.eyebrow).trim() || fallback.eyebrow,
    title: String(deal?.title ?? fallback.title).trim() || fallback.title,
    subtitle:
      String(deal?.subtitle ?? fallback.subtitle).trim() || fallback.subtitle,
    image: String(deal?.image ?? fallback.image).trim() || fallback.image,
    href: String(deal?.href ?? fallback.href).trim() || fallback.href,
    ctaLabel:
      String(deal?.ctaLabel ?? fallback.ctaLabel).trim() || fallback.ctaLabel,
    endsAt: Number.isNaN(rawDate.getTime())
      ? fallback.endsAt
      : rawDate.toISOString(),
  };
};

export const normalizeMarketingSettings = (
  settings?: Partial<MarketingSettingsData> | null,
): MarketingSettingsData => {
  const banners = Array.isArray(settings?.banners)
    ? settings.banners.map(normalizeBanner).filter((banner) => banner.image)
    : [];

  return {
    banners: banners.length > 0 ? banners : DEFAULT_MARKETING_SETTINGS.banners,
    specialDeal: normalizeDeal(settings?.specialDeal),
  };
};

export const getMarketingSettings = cache(async (): Promise<MarketingSettingsData> => {
  await startDbConnection();

  const settings = await MarketingSettings.findOne({ key: "homepage" }).lean();
  return normalizeMarketingSettings(settings as Partial<MarketingSettingsData>);
});

export const getOrCreateMarketingSettings =
  async (): Promise<MarketingSettingsData> => {
    await startDbConnection();

    const settings = await MarketingSettings.findOneAndUpdate(
      { key: "homepage" },
      {
        $setOnInsert: {
          key: "homepage",
          banners: DEFAULT_MARKETING_SETTINGS.banners,
          specialDeal: {
            ...DEFAULT_MARKETING_SETTINGS.specialDeal,
            endsAt: new Date(DEFAULT_MARKETING_SETTINGS.specialDeal.endsAt),
          },
        },
      },
      { returnDocument: "after", upsert: true },
    ).lean();

    return normalizeMarketingSettings(
      settings as Partial<MarketingSettingsData>,
    );
  };
