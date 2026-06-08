import type { Metadata } from "next";

import BrowseByCategories from "@/components/BrowseByCategories";
import FeaturedBanners from "@/components/FeaturedBanners";
import FeaturesList from "@/components/FeaturesList";
import MainDiscount from "@/components/MainDiscount";
import NewArrivals from "@/components/NewArrivals";

export const revalidate = 60;
export const metadata: Metadata = {
  title: { absolute: "Accueil - PRIMEPC" },
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default async function page() {
  return (
    <div className="mx-auto max-w-350 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <FeaturedBanners />

      <FeaturesList />

      <BrowseByCategories />

      <NewArrivals />

      <MainDiscount />
    </div>
  );
}
