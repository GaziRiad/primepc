import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "node:fs/promises";
import path from "node:path";
import mongoose, { Types } from "mongoose";

import startDbConnection from "../lib/db";
import Product from "../models/Product";
import Category from "../models/Category";
import { type Product as Tproducts } from "@/types/types";

// type SeedProduct = {
//   name: string;
//   slug: string;
//   brand: string;
//   description: string;
//   price: number;
//   discount: number;
//   coverImage: string;
//   images: string[];
//   specs: Record<string, string>;
//   categories: string[]; // ObjectId strings from products.json
// };

function toObjectIdArray(values: string[]) {
  return values.filter(Boolean).map((value) => {
    if (!Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid category ObjectId: ${value}`);
    }
    return new Types.ObjectId(value);
  });
}

async function readSeedFile() {
  const filePath = path.join(process.cwd(), "lib", "products.json");
  const content = await fs.readFile(filePath, "utf-8");
  const parsed = JSON.parse(content) as Tproducts[];

  if (!Array.isArray(parsed)) {
    throw new Error("products.json must be an array");
  }

  return parsed;
}

async function seedProducts({ reset = false }: { reset?: boolean }) {
  await startDbConnection();

  const items = await readSeedFile();

  if (reset) {
    await Product.deleteMany({});
    await Category.updateMany({}, { $set: { products: [] } });
  }

  // Upsert by slug so reruns are safe
  const ops = items.map((item) => ({
    replaceOne: {
      filter: { slug: item.slug },
      replacement: {
        name: item.name,
        slug: item.slug,
        brand: item.brand,
        description: item.description,
        price: item.price,
        discount: item.discount,
        coverImage: item.coverImage,
        images: item.images ?? [],
        specs: item.specs ?? {},
        categories: toObjectIdArray(item.categories ?? []),
      },
      upsert: true,
    },
  }));

  const result = await Product.bulkWrite(ops, { ordered: false });

  // Sync inverse relation: Category.products[]
  const products = await Product.find({}, { _id: 1, categories: 1 }).lean();
  const categoryToProducts = new Map<string, Types.ObjectId[]>();

  for (const product of products) {
    for (const categoryId of product.categories ?? []) {
      const key = String(categoryId);
      const list = categoryToProducts.get(key) ?? [];
      list.push(product._id);
      categoryToProducts.set(key, list);
    }
  }

  // Reset inverse side first, then write the current mapping.
  await Category.updateMany({}, { $set: { products: [] } });

  const categoryUpdates = Array.from(categoryToProducts.entries()).map(
    ([categoryId, productIds]) =>
      Category.updateOne(
        { _id: new Types.ObjectId(categoryId) },
        { $set: { products: productIds } },
      ),
  );

  if (categoryUpdates.length > 0) {
    await Promise.all(categoryUpdates);
  }

  console.log("Seed completed.");
  console.log({
    matched: result.matchedCount,
    modified: result.modifiedCount,
    upserted: result.upsertedCount,
  });
}

async function main() {
  const reset = process.argv.includes("--reset");
  try {
    await seedProducts({ reset });
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
