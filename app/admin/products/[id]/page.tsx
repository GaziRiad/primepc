import { notFound } from "next/navigation";
import { Types } from "mongoose";

import Category from "@/models/Category";
import Product from "@/models/Product";
import startDbConnection from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

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

  const product = await Product.findById(id).lean();
  if (!product) {
    notFound();
  }

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

  const specs =
    product.specs instanceof Map
      ? Object.fromEntries(product.specs)
      : ((product.specs as Record<string, string> | undefined) ?? {});

  const safeProduct = {
    _id: String(product._id),
    name: product.name,
    slug: product.slug,
    brand: product.brand ?? "",
    description: product.description ?? "",
    price: Number(product.price ?? 0),
    discount: Number(product.discount ?? 0),
    stock: Number(product.stock ?? 0),
    coverImage: product.coverImage ?? "",
    images: Array.isArray(product.images) ? product.images : [],
    categories: Array.isArray(product.categories)
      ? product.categories.map((category: unknown) => String(category))
      : [],
    specs,
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Edit product</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Update product details, pricing, and inventory.
        </p>
      </div>

      <ProductForm
        mode="edit"
        product={safeProduct}
        categories={safeCategories}
      />
    </div>
  );
}
