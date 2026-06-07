import CategoryForm from "@/components/admin/CategoryForm";

export default async function page() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Créer la catégorie
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Ajoutez une nouvelle catégorie pour organiser et filtrer les produits.
        </p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}
