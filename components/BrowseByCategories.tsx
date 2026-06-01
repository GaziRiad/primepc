import { getAllCategories } from "@/lib/services";
import BrowseByCategoriesCarousel from "@/components/BrowseByCategoriesCarousel";

type Category = {
  name: string;
  slug: string;
  image: string;
};

export default async function BrowseByCategories() {
  const categories = (await getAllCategories()) as Category[];

  return (
    <section className="pt-16 sm:pt-20">
      <h2 className="text-foreground mb-8 text-center text-xl font-semibold sm:text-2xl">
        Parcourir par categorie
      </h2>
      {categories.length === 0 ? (
        <p className="text-accent-400 text-center text-sm">
          Aucune categorie disponible pour le moment.
        </p>
      ) : (
        <BrowseByCategoriesCarousel categories={categories} />
      )}
    </section>
  );
}
