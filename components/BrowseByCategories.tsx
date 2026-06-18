import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { getAllCategories } from "@/lib/services";
import BrowseByCategoriesCarousel from "@/components/BrowseByCategoriesCarousel";
import { Button } from "@/components/ui/button";

type Category = {
  name: string;
  slug: string;
  image: string;
};

export default async function BrowseByCategories() {
  const categories = (await getAllCategories()) as Category[];

  return (
    <section>
      <h2 className="text-foreground mb-8 text-center text-xl font-semibold sm:text-2xl">
        Parcourir par catégorie
      </h2>
      {categories.length === 0 ? (
        <p className="text-accent-400 text-center text-sm">
          Aucune catégorie disponible pour le moment.
        </p>
      ) : (
        <BrowseByCategoriesCarousel categories={categories} />
      )}

      <div className="mt-8 flex justify-center">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/products">
            Explorer tous les produits
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
