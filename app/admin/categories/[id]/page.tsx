import { notFound } from "next/navigation";
import { Types } from "mongoose";

import startDbConnection from "@/lib/db";
import Category from "@/models/Category";
import CategoryForm from "@/components/admin/CategoryForm";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
        <h2 className="text-foreground text-xl font-semibold">Edit category</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Update category details and visibility.
        </p>
      </div>

      <CategoryForm mode="edit" category={safeCategory} />
    </div>
  );
}
