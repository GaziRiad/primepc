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
        isActive: true,
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
        isActive: true,
      }).lean();

      const categoryIds = categoryDocs.map((c) => c._id);

      if (!categoryIds.length) {
        return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      }
      mongoQuery.categories = { $in: categoryIds };
    }

    const minRaw = toSingle(queryObj.minPrice);
    const maxRaw = toSingle(queryObj.maxPrice);

    if (
      (minRaw && Number.isNaN(Number(minRaw))) ||
      (maxRaw && Number.isNaN(Number(maxRaw)))
    ) {
      return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    }

    if (minRaw || maxRaw) {
      const min = minRaw ? Number(minRaw) : undefined;
      const max = maxRaw ? Number(maxRaw) : undefined;

      if (min !== undefined && max !== undefined && min > max) {
        return { items: [], total: 0, page: 1, limit: 10, totalPages: 0 };
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
        : 10;
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
      .populate({
        path: "categories",
        select: "name slug",
        match: { isActive: true },
      })
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
    const categories = await Category.find({ isActive: true })
      .select("name slug image -_id")
      .sort({ name: 1 })
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

    const userFavorites = await Favorite.find({ user: userId })
      .select("product")
      .lean();

    const productIds = userFavorites
      .map((favorite) => String(favorite.product ?? ""))
      .filter(Boolean);

    if (productIds.length === 0) return [];

    const products = await Product.find({ _id: { $in: productIds } })
      .select("name price discount finalPrice coverImage slug _id stock")
      .lean();

    const productMap = new Map(
      products.map((product) => [String(product._id), product]),
    );

    const missingIds = productIds.filter((id) => !productMap.has(id));
    if (missingIds.length > 0) {
      await Favorite.deleteMany({ user: userId, product: { $in: missingIds } });
    }

    return userFavorites
      .map((favorite) => {
        const productId = String(favorite.product ?? "");
        const product = productMap.get(productId);
        if (!product) return null;
        return { _id: favorite._id, product };
      })
      .filter(
        (
          favorite,
        ): favorite is { _id: unknown; product: (typeof products)[0] } =>
          Boolean(favorite),
      );
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
      .select("items")
      .lean();

    if (!cartDoc) {
      return { items: [], itemsCount: 0 };
    }

    const rawItems = Array.isArray(cartDoc.items)
      ? (cartDoc.items as Array<{ product?: unknown; quantity?: unknown }>)
      : [];
    const productIds = rawItems
      .map((item) => String(item.product ?? ""))
      .filter(Boolean);

    if (productIds.length === 0) {
      return { items: [], itemsCount: 0 };
    }

    const uniqueIds = Array.from(new Set(productIds));
    const products = await Product.find({ _id: { $in: uniqueIds } })
      .select("name price discount finalPrice coverImage slug stock")
      .lean();

    const productMap = new Map(
      products.map((product) => [String(product._id), product]),
    );

    const items = rawItems
      .map((item) => {
        const productId = String(item.product ?? "");
        const product = productMap.get(productId);
        if (!product) return null;

        const quantity = Math.floor(Number(item.quantity ?? 1));
        if (!Number.isFinite(quantity) || quantity <= 0) return null;

        return { product, quantity };
      })
      .filter(
        (item): item is { product: (typeof products)[0]; quantity: number } =>
          Boolean(item),
      );

    const missingIds = uniqueIds.filter((id) => !productMap.has(id));
    if (missingIds.length > 0) {
      await Cart.updateOne(
        { user: session.user.id },
        { $pull: { items: { product: { $in: missingIds } } } },
      );
    }

    const itemsCount = items.reduce(
      (sum, item) => sum + (item.quantity ?? 0),
      0,
    );

    return { items, itemsCount };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
};
