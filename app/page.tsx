import BrowseByCategories from "@/components/BrowseByCategories";
import FeaturedBanners from "@/components/FeaturedBanners";
import FeaturesList from "@/components/FeaturesList";
import MainDiscount from "@/components/MainDiscount";
import NewArrivals from "@/components/NewArrivals";

export default async function page() {
  return (
    <div className="mx-auto max-w-7xl py-12">
      <FeaturedBanners />

      <FeaturesList />

      <BrowseByCategories />

      <NewArrivals />

      <MainDiscount />
    </div>
  );
}
