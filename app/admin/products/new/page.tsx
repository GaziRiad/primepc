import Category from "@/models/Category";
import startDbConnection from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export default async function page() {
  await startDbConnection();

  const categories = await Category.find()
    .select("name slug")
    .sort({ name: 1 })
    .lean();

  const safeCategories = categories.map((category) => ({
    _id: String(category._id),
    name: category.name,
    slug: category.slug,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Create product
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Add a new product to your catalog.
        </p>
      </div>

      <ProductForm mode="create" categories={safeCategories} />
    </div>
  );
}
