"use server";

import Category from "@/models/Category";
import startDbConnection from "./db";
import { cache } from "react";
import Product from "@/models/Product";

import type { QueryFilter } from "mongoose";
import type { TProduct } from "@/types/types";
import Favorite from "@/models/Favorite";
import Cart from "@/models/Cart";
import { auth } from "./auth";

type QueryParams = { [key: string]: string | string[] | undefined };

export const getAllProducts = async (query?: QueryParams) => {
  try {
    await startDbConnection();

    // await new Promise((resolve) => setTimeout(resolve, 4000));

    const toSingle = (value: string | string[] | undefined) =>
      Array.isArray(value) ? value[0] : value;

    const queryObj = {
      ...query,
    };

    const searchTerm = toSingle(queryObj.q);
    delete queryObj.q;

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

    if (typeof searchTerm === "string" && searchTerm.trim()) {
      const escaped = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      mongoQuery.$or = [
        { name: regex },
        { brand: regex },
        { description: regex },
      ];
    }

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
};

export const getProductsPage = async (query?: QueryParams) => {
  try {
    await startDbConnection();

    const toSingle = (value: string | string[] | undefined) =>
      Array.isArray(value) ? value[0] : value;

    const queryObj = {
      ...query,
    };

    const searchTerm = toSingle(queryObj.q);
    delete queryObj.q;

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

      if (!categoryIds.length) {
        return { items: [], total: 0, page: 1, limit: 8, totalPages: 0 };
      }
      mongoQuery.categories = { $in: categoryIds };
    }

    const minRaw = toSingle(queryObj.minPrice);
    const maxRaw = toSingle(queryObj.maxPrice);

    if (
      (minRaw && Number.isNaN(Number(minRaw))) ||
      (maxRaw && Number.isNaN(Number(maxRaw)))
    ) {
      return { items: [], total: 0, page: 1, limit: 8, totalPages: 0 };
    }

    if (minRaw || maxRaw) {
      const min = minRaw ? Number(minRaw) : undefined;
      const max = maxRaw ? Number(maxRaw) : undefined;

      if (min !== undefined && max !== undefined && min > max) {
        return { items: [], total: 0, page: 1, limit: 8, totalPages: 0 };
      }

      mongoQuery.price = {};
      if (min !== undefined) mongoQuery.price.$gte = min;
      if (max !== undefined) mongoQuery.price.$lte = max;
    }

    delete mongoQuery["minPrice"];
    delete mongoQuery["maxPrice"];

    if (typeof searchTerm === "string" && searchTerm.trim()) {
      const escaped = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      mongoQuery.$or = [
        { name: regex },
        { brand: regex },
        { description: regex },
      ];
    }

    let dbQuery = Product.find(mongoQuery);

    if (typeof query?.sort === "string" && query?.sort.trim()) {
      const isValidSort = /^-?[a-zA-Z0-9_]+(,-?[a-zA-Z0-9_]+)*$/.test(
        query.sort,
      );

      if (isValidSort) {
        const sortBy = query.sort.split(",").join(" ");
        dbQuery = dbQuery.sort(sortBy);
      }
    }

    const limitRaw = Number(query?.limit);
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0
        ? Math.min(Math.floor(limitRaw), 48)
        : 8;
    const pageRaw = Math.floor(Number(query?.page));
    const requestedPage = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

    const total = await Product.countDocuments(mongoQuery);
    const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
    const page = Math.min(requestedPage, totalPages || 1);
    const skip = (page - 1) * limit;

    const items = await dbQuery.skip(skip).limit(limit).lean();

    return { items, total, page, limit, totalPages };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
};

export const getProduct = cache(async (slug: string) => {
  try {
    await startDbConnection();
    const product = await Product.findOne({ slug })
      .populate("categories", "name slug")
      .lean();

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

export const getMyFavoriteProducts = async (userId: string) => {
  try {
    await startDbConnection();

    if (!userId) return [];

    const userFavorites = await Favorite.find({
      user: userId,
    })
      .select("product")
      .populate(
        "product",
        "name price discount finalPrice coverImage slug _id stock",
      )
      .lean();

    return userFavorites;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
};

// CART SERVICES
export const getCartItems = async () => {
  try {
    await startDbConnection();

    const session = await auth();

    if (!session?.user?.id) {
      return { items: [], itemsCount: 0 };
    }

    const cartDoc = await Cart.findOne({ user: session.user.id })
      .populate(
        "items.product",
        "name price discount finalPrice coverImage slug stock",
      )
      .select("items");

    if (!cartDoc) {
      return { items: [], itemsCount: 0 };
    }

    const cart = cartDoc.toObject({ virtuals: true });

    return {
      items: cart.items ?? [],
      itemsCount: Number(cart.itemsCount ?? 0),
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
};
