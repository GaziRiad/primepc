import BrowseByCategories from "@/components/BrowseByCategories";
import FeaturedBanners from "@/components/FeaturedBanners";
import FeaturesList from "@/components/FeaturesList";
import MainDiscount from "@/components/MainDiscount";
import NewArrivals from "@/components/NewArrivals";

export default function page() {
  return (
    <div className="min-h-screen py-12">
      {/* <Navigation /> */}
      <div className="mx-auto max-w-7xl">
        <FeaturedBanners />

        <FeaturesList />

        <BrowseByCategories />

        <NewArrivals />

        <MainDiscount />
      </div>
    </div>
  );
}
