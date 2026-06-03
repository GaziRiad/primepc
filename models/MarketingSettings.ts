import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    alt: { type: String, default: "PRIMEPC marketing banner" },
    href: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { _id: false },
);

const specialDealSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: true },
    eyebrow: { type: String, default: "Don't Miss!!" },
    title: { type: String, default: "Enhance Your Work Experience" },
    subtitle: { type: String, default: "Work and gaming setup deals" },
    image: { type: String, default: "/images/sutdy.png" },
    href: { type: String, default: "/products?sort=-discount" },
    ctaLabel: { type: String, default: "Check it out!" },
    endsAt: { type: Date, default: () => new Date("2026-12-31T22:59:59Z") },
  },
  { _id: false },
);

const MarketingSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "homepage" },
    heroSlides: { type: [bannerSchema], default: [] },
    sideBanners: { type: [bannerSchema], default: [] },
    banners: { type: [bannerSchema], default: undefined },
    specialDeal: { type: specialDealSchema, default: () => ({}) },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const existingModel = mongoose.models.MarketingSettings;

if (existingModel) {
  const hasHeroSlides = existingModel.schema.path("heroSlides");
  const hasSideBanners = existingModel.schema.path("sideBanners");

  if (!hasHeroSlides || !hasSideBanners) {
    delete mongoose.models.MarketingSettings;
  }
}

const MarketingSettings =
  mongoose.models.MarketingSettings ||
  mongoose.model("MarketingSettings", MarketingSettingsSchema);

export default MarketingSettings;
