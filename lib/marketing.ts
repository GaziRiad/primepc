import "server-only";

import startDbConnection from "@/lib/db";
import MarketingSettings from "@/models/MarketingSettings";
import type {
  MarketingBanner,
  MarketingSettingsData,
  SpecialDealSettings,
} from "@/types/marketing";

export const DEFAULT_MARKETING_SETTINGS: MarketingSettingsData = {
  heroSlides: [
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
  sideBanners: [
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
  settings?: (Partial<MarketingSettingsData> & {
    banners?: Partial<MarketingBanner>[];
  }) | null,
): MarketingSettingsData => {
  const legacyBanners = Array.isArray(settings?.banners)
    ? settings.banners.map(normalizeBanner).filter((banner) => banner.image)
    : [];
  const heroSlides = Array.isArray(settings?.heroSlides)
    ? settings.heroSlides.map(normalizeBanner).filter((banner) => banner.image)
    : [];
  const sideBanners = Array.isArray(settings?.sideBanners)
    ? settings.sideBanners.map(normalizeBanner).filter((banner) => banner.image)
    : [];

  return {
    heroSlides:
      heroSlides.length > 0
        ? heroSlides
        : legacyBanners.length > 0
          ? legacyBanners
          : DEFAULT_MARKETING_SETTINGS.heroSlides,
    sideBanners:
      sideBanners.length > 0
        ? sideBanners.slice(0, 2)
        : legacyBanners.length > 1
          ? legacyBanners.slice(1, 3)
          : DEFAULT_MARKETING_SETTINGS.sideBanners,
    specialDeal: normalizeDeal(settings?.specialDeal),
  };
};

export const getMarketingSettings = async (): Promise<MarketingSettingsData> => {
  await startDbConnection();

  const settings = await MarketingSettings.findOne({ key: "homepage" }).lean();
  return normalizeMarketingSettings(settings as Partial<MarketingSettingsData>);
};

export const getOrCreateMarketingSettings =
  async (): Promise<MarketingSettingsData> => {
    await startDbConnection();

    const settings = await MarketingSettings.findOneAndUpdate(
      { key: "homepage" },
      {
        $setOnInsert: {
          key: "homepage",
          heroSlides: DEFAULT_MARKETING_SETTINGS.heroSlides,
          sideBanners: DEFAULT_MARKETING_SETTINGS.sideBanners,
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
