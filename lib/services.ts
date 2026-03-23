"use server";

import Category from "@/models/Category";
import startDbConnection from "./db";
import { cache } from "react";
import Product from "@/models/Product";

import type { QueryFilter } from "mongoose";
import type { TProduct } from "@/types/types";
import Favorite from "@/models/Favorite";

type QueryParams = { [key: string]: string | string[] | undefined };

export const getAllProducts = async (query?: QueryParams, userId?: string) => {
  try {
    await startDbConnection();

    const toSingle = (value: string | string[] | undefined) =>
      Array.isArray(value) ? value[0] : value;

    const queryObj = {
      ...query,
    };

    const excludedFields = ["page", "sort", "limit", "fields"];

    excludedFields.forEach((field) => delete queryObj[field]);

    const mongoQuery: QueryFilter<TProduct> = {
      ...queryObj,
    } as QueryFilter<TProduct>;

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

    const minRaw = toSingle(queryObj.minPrice);
    const maxRaw = toSingle(queryObj.maxPrice);

    if (
      (minRaw && Number.isNaN(Number(minRaw))) ||
      (maxRaw && Number.isNaN(Number(maxRaw)))
    ) {
      return [];
    }

    if (minRaw || maxRaw) {
      const min = minRaw ? Number(minRaw) : undefined;
      const max = maxRaw ? Number(maxRaw) : undefined;

      if (min !== undefined && max !== undefined && min > max) return [];

      mongoQuery.price = {};
      if (min !== undefined) mongoQuery.price.$gte = min;
      if (max !== undefined) mongoQuery.price.$lte = max;
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

    // NEW: only add favorite flag when a user is provided
    // if (!userId) return products;

    // const favoriteIds = await getMyFavoriteProductIds(userId);
    // const favoriteSet = new Set(favoriteIds);

    // return products.map((p) => ({
    //   ...p,
    //   isFavorite: favoriteSet.has(String(p._id)),
    // }));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
};

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

//

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

// FAVORITES SERVICES

export const getMyFavoriteProductIds = async (userId: string) => {
  try {
    await startDbConnection();

    if (!userId) return [];

    const userFavorites = await Favorite.find({
      user: userId,
    })
      .select("product -_id")
      .lean();

    return userFavorites.map((f) => String(f.product));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
};
