import mongoose from "mongoose";
import { config } from "dotenv";

import startDbConnection from "../lib/db";
import { getR2StorageStatus, uploadImageToR2 } from "../lib/r2Storage";
import Product from "../models/Product";

const apply = process.argv.includes("--apply");
const CLOUDINARY_URL_REGEX = /^https:\/\/res\.cloudinary\.com\//i;

type ProductDocument = {
  _id: unknown;
  coverImage?: string;
  images?: string[];
  name?: string;
  variants?: Array<Record<string, unknown> & { image?: string }>;
};

const isCloudinaryUrl = (value: unknown) =>
  typeof value === "string" && CLOUDINARY_URL_REGEX.test(value.trim());

const getFilenameFromUrl = (url: string, contentType: string) => {
  const extensionFromType =
    {
      "image/avif": "avif",
      "image/gif": "gif",
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    }[contentType] ?? "jpg";

  try {
    const pathname = new URL(url).pathname;
    const candidate = decodeURIComponent(pathname.split("/").pop() ?? "");
    if (candidate && /\.[a-z0-9]{2,5}$/i.test(candidate)) return candidate;
  } catch {
    // Fall through to a generated filename.
  }

  return `cloudinary-image.${extensionFromType}`;
};

const downloadImage = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${response.status}`);
  }

  const contentType =
    response.headers.get("content-type")?.split(";")[0]?.trim() ||
    "image/jpeg";

  if (!contentType.startsWith("image/")) {
    throw new Error(`Cloudinary URL did not return an image: ${url}`);
  }

  return new File([await response.arrayBuffer()], getFilenameFromUrl(url, contentType), {
    type: contentType,
  });
};

const getCloudinaryUrls = (product: ProductDocument) => {
  const urls = new Set<string>();

  if (isCloudinaryUrl(product.coverImage)) urls.add(product.coverImage!.trim());

  for (const image of product.images ?? []) {
    if (isCloudinaryUrl(image)) urls.add(image.trim());
  }

  for (const variant of product.variants ?? []) {
    if (isCloudinaryUrl(variant.image)) urls.add(variant.image!.trim());
  }

  return urls;
};

const main = async () => {
  config({ path: ".env.local" });
  config();

  if (apply) {
    const r2Status = getR2StorageStatus();
    if (!r2Status.configured) {
      throw new Error(
        `Cloudflare R2 is not fully configured. Missing: ${r2Status.missing.join(
          ", ",
        )}`,
      );
    }
  }

  await startDbConnection();

  const products = (await Product.find({
    $or: [
      { coverImage: CLOUDINARY_URL_REGEX },
      { images: CLOUDINARY_URL_REGEX },
      { "variants.image": CLOUDINARY_URL_REGEX },
    ],
  })
    .select("_id name coverImage images variants")
    .lean()) as ProductDocument[];

  const urls = new Set<string>();
  for (const product of products) {
    for (const url of getCloudinaryUrls(product)) urls.add(url);
  }

  console.log(
    `${products.length} product(s) reference ${urls.size} unique Cloudinary image URL(s).`,
  );

  if (!apply) {
    console.log("Dry run only. Re-run with --apply to copy images and update MongoDB.");
    await mongoose.disconnect();
    return;
  }

  const migratedUrls = new Map<string, string>();
  const migrateUrl = async (url: string) => {
    const cached = migratedUrls.get(url);
    if (cached) return cached;

    const file = await downloadImage(url);
    const upload = await uploadImageToR2(file, "primepc/products");
    migratedUrls.set(url, upload.url);
    console.log(`Migrated ${url} -> ${upload.url}`);
    return upload.url;
  };

  for (const product of products) {
    const updates: Record<string, unknown> = {};

    if (isCloudinaryUrl(product.coverImage)) {
      updates.coverImage = await migrateUrl(product.coverImage!.trim());
    }

    if (Array.isArray(product.images)) {
      const nextImages = await Promise.all(
        product.images.map((image) =>
          isCloudinaryUrl(image) ? migrateUrl(image.trim()) : image,
        ),
      );

      if (nextImages.some((image, index) => image !== product.images![index])) {
        updates.images = nextImages;
      }
    }

    if (Array.isArray(product.variants)) {
      const nextVariants = await Promise.all(
        product.variants.map(async (variant) => ({
          ...variant,
          image: isCloudinaryUrl(variant.image)
            ? await migrateUrl(variant.image!.trim())
            : variant.image,
        })),
      );

      if (
        nextVariants.some(
          (variant, index) => variant.image !== product.variants![index].image,
        )
      ) {
        updates.variants = nextVariants;
      }
    }

    if (Object.keys(updates).length > 0) {
      await Product.updateOne({ _id: product._id }, { $set: updates });
      console.log(`Updated product: ${product.name ?? product._id}`);
    }
  }

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => null);
  process.exitCode = 1;
});
