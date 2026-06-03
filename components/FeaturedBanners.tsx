import FeaturedBannersCarousel from "@/components/FeaturedBannersCarousel";
import { getMarketingSettings } from "@/lib/marketing";

export default async function FeaturedBanners() {
  const settings = await getMarketingSettings();

  return <FeaturedBannersCarousel banners={settings.banners} />;
}
