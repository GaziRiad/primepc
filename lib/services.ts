"use server";

import startDbConnection from "./db";
import Product from "@/models/Product";

export async function getAllProducts() {
  try {
    startDbConnection();
    const products = await Product.find().lean();

    return products;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";

    throw new Error(message);
  }
}
