"use server";

import Category from "@/models/Category";
import startDbConnection from "./db";
import Product from "@/models/Product";

export async function getAllProducts(query: {
  [key: string]: string | string[] | undefined;
}) {
  try {
    startDbConnection();

    const category = await Category.findOne({ slug: query.categories }).lean();

    const products = await Product.find().lean();

    console.log(products);

    return products;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
}

export async function getProduct(id: string) {
  try {
    // console.log(query);
    startDbConnection();
    const product = await Product.findById(id).populate("categories").lean();

    // console.log();

    return product;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
}

export async function getAllCategories() {
  try {
    // console.log(query);
    startDbConnection();
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
}
