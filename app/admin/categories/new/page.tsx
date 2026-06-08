import CategoryForm from "@/components/admin/CategoryForm";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminAuth";

export const metadata: Metadata = {
  title: "Nouvelle catégorie - Administration",
};

export default async function page() {
  await requireAdmin();
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
