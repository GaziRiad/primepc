import FeaturedBanners from "@/components/FeaturedBanners";
import FeaturesList from "@/components/FeaturesList";
import Navigation from "@/components/Navigation";

export default function page() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="mx-auto max-w-6xl">
        <FeaturedBanners />

        <FeaturesList />
      </div>
    </div>
  );
}
