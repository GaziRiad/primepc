import Category from "@/models/Category";
import startDbConnection from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminAuth";

export const metadata: Metadata = {
  title: "Nouveau produit - Administration",
};

export default async function page() {
  await requireAdmin();
  await startDbConnection();

  const categories = await Category.find()
    .select("name slug isActive")
    .sort({ name: 1 })
    .lean();

  const safeCategories = categories.map((category) => ({
    _id: String(category._id),
    name: category.name,
    slug: category.slug,
    isActive: Boolean(category.isActive),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Créer le produit
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Ajoutez un nouveau produit à votre catalogue.
        </p>
      </div>

      <ProductForm mode="create" categories={safeCategories} />
    </div>
  );
}
