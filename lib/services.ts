"use server";

import Category from "@/models/Category";
import startDbConnection from "./db";
import Product from "@/models/Product";
import { cache } from "react";

export const getAllProducts = cache(
  async (query?: { [key: string]: string | string[] | undefined }) => {
    try {
      await startDbConnection();

      // 1. normalize, make it defulat to string[]
      const categories = Array.isArray(query?.categories)
        ? query?.categories
        : query?.categories
          ? [query?.categories]
          : [];

      // 2. get category IDs
      const categoryDocs = await Category.find({
        slug: { $in: categories },
      }).lean();

      const categoryIds = categoryDocs.map((c) => c._id);

      // 3. build query
      const mongoQuery: { categories?: { $in: typeof categoryIds } } = {};

      if (categoryIds.length) {
        mongoQuery.categories = { $in: categoryIds };
      }

      // 4. fetch
      const products = await Product.find(mongoQuery).lean();

      return products;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Internal server error";

      throw new Error(message);
    }
  },
);

export const getProduct = cache(async (id: string) => {
  try {
    // console.log(query);
    await startDbConnection();
    const product = await Product.findById(id).populate("categories").lean();

    // console.log();

    return product;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
});

export const getAllCategories = cache(async () => {
  try {
    // console.log(query);
    await startDbConnection();
    const categories = await Category.find()
      .select("name slug image -_id")
      .lean();

    // console.log();

    return categories;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
});
