import type { MetadataRoute } from "next";

import startDbConnection from "@/lib/db";
import { getSiteUrl } from "@/lib/site";
import Product from "@/models/Product";

const publicRoutes = [
  "",
  "/products",
  "/about",
  "/blogs",
  "/contact",
  "/delivery",
  "/delivery-returns",
  "/returns",
  "/warranty",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const generatedAt = new Date();
  const staticPages = publicRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: generatedAt,
    changeFrequency: path === "" || path === "/products" ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.6,
  })) satisfies MetadataRoute.Sitemap;

  try {
    await startDbConnection();
    const products = await Product.find()
      .select("slug updatedAt")
      .lean();

    return [
      ...staticPages,
      ...products
        .filter((product) => Boolean(product.slug))
        .map((product) => ({
          url: `${siteUrl}/products/${product.slug}`,
          lastModified: product.updatedAt ?? generatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),
    ];
  } catch {
    return staticPages;
  }
}
