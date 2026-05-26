import startDbConnection from "@/lib/db";
import Category from "@/models/Category";
import CategoriesToolbar from "@/components/admin/CategoriesToolbar";
import CategoriesTable from "@/components/admin/CategoriesTable";

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const search = typeof query.q === "string" ? query.q.trim() : "";

  await startDbConnection();

  const filter: Record<string, unknown> = {};

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [{ name: regex }, { slug: regex }];
  }

  const categories = await Category.find(filter)
    .sort({ updatedAt: -1 })
    .select("name slug image isActive updatedAt")
    .lean();

  const safeCategories = categories.map((category) => ({
    _id: String(category._id),
    name: category.name,
    slug: category.slug,
    image: category.image ?? "",
    isActive: Boolean(category.isActive),
    updatedAt:
      category.updatedAt?.toISOString?.() ?? String(category.updatedAt),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Categories</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Create and manage storefront categories.
        </p>
      </div>

      <CategoriesToolbar key={search} initialQuery={search} />

      <CategoriesTable categories={safeCategories} />
    </div>
  );
}
