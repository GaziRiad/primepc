import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Types } from "mongoose";

import startDbConnection from "@/lib/db";
import Category from "@/models/Category";
import CategoryForm from "@/components/admin/CategoryForm";
import { requireAdmin } from "@/lib/adminAuth";

export const metadata: Metadata = {
  title: "Modifier la catégorie - Administration",
};

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    notFound();
  }

  await startDbConnection();

  const category = await Category.findById(id)
    .select("name slug image isActive")
    .lean();

  if (!category) {
    notFound();
  }

  const safeCategory = {
    _id: String(category._id),
    name: category.name,
    slug: category.slug,
    image: category.image ?? "",
    isActive: Boolean(category.isActive),
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Modifier la catégorie
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Modifiez les informations et la visibilité de la catégorie.
        </p>
      </div>

      <CategoryForm mode="edit" category={safeCategory} />
    </div>
  );
}
