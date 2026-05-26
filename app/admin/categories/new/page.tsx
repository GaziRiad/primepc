import CategoryForm from "@/components/admin/CategoryForm";

export default async function page() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Create category
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Add a new category for products and filters.
        </p>
      </div>

      <CategoryForm mode="create" />
    </div>
  );
}
