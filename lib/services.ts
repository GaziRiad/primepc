"use server";

import Category from "@/models/Category";
import startDbConnection from "./db";
import Product from "@/models/Product";
import { cache } from "react";

export const getAllProducts = cache(
  async (query?: { [key: string]: string | string[] | undefined }) => {
    try {
      await startDbConnection();

      const queryObj = {
        ...query,
      };

      const excludedFields = ["page", "sort", "limit", "fields"];

      excludedFields.forEach((field) => delete queryObj[field]);

      const mongoQuery: any = { ...queryObj };

      if (queryObj.categories) {
        const categories = Array.isArray(queryObj.categories)
          ? queryObj.categories
          : [queryObj.categories];

        const categoryDocs = await Category.find({
          slug: { $in: categories },
        }).lean();

        const categoryIds = categoryDocs.map((c) => c._id);

        if (!categoryIds.length) return [];
        mongoQuery.categories = { $in: categoryIds };
      }

      //

      if (queryObj.minPrice || queryObj.maxPrice) {
        mongoQuery.price = {};

        if (queryObj.minPrice) {
          mongoQuery.price.$gte = Number(queryObj.minPrice);
        }

        if (queryObj.maxPrice) {
          mongoQuery.price.$lte = Number(queryObj.maxPrice);
        }
      }

      delete mongoQuery["minPrice"];
      delete mongoQuery["maxPrice"];

      let dbQuery = Product.find(mongoQuery);

      // SORTING

      if (typeof query?.sort === "string" && query?.sort.trim()) {
        const isValidSort = /^-?[a-zA-Z0-9_]+(,-?[a-zA-Z0-9_]+)*$/.test(
          query.sort,
        );

        if (isValidSort) {
          const sortBy = query.sort.split(",").join(" ");
          dbQuery = dbQuery.sort(sortBy);
        }
        // else: ignore invalid sort and keep default order
      }

      // PAGINATION
      const page = Number(query?.page) || 1;
      const limit = Number(query?.limit) || 8;
      const skip = (page - 1) * limit;

      dbQuery = dbQuery.skip(skip).limit(limit);

      // 4. fetch
      const products = await dbQuery.lean();

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
    await startDbConnection();
    const product = await Product.findById(id).populate("categories").lean();

    return product;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
});

export const getAllCategories = cache(async () => {
  try {
    await startDbConnection();
    const categories = await Category.find()
      .select("name slug image -_id")
      .lean();

    return categories;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
});
