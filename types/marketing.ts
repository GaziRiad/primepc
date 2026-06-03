export type MarketingBanner = {
  image: string;
  alt: string;
  href: string;
  isActive: boolean;
};

export type SpecialDealSettings = {
  enabled: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  ctaLabel: string;
  endsAt: string;
};

export type MarketingSettingsData = {
  banners: MarketingBanner[];
  specialDeal: SpecialDealSettings;
};
