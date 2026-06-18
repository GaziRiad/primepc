import type { Metadata } from "next";

import BrowseByCategories from "@/components/BrowseByCategories";
import FeaturedBanners from "@/components/FeaturedBanners";
import FeaturesList from "@/components/FeaturesList";
import MainDiscount from "@/components/MainDiscount";
import NewArrivals from "@/components/NewArrivals";
import TopSellers from "@/components/TopSellers";

export const revalidate = 60;
export const metadata: Metadata = {
  title: { absolute: "Accueil - PRIMEPC" },
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export default async function page() {
  return (
    <div className="mx-auto max-w-350 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <FeaturedBanners />

      <div className="mt-8 flex flex-col gap-14 sm:mt-10 sm:gap-16 lg:gap-20">
        <FeaturesList />

        <BrowseByCategories />

        <NewArrivals />

        <MainDiscount />

        <TopSellers />
      </div>
    </div>
  );
}
