import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const IMAGE_CONTENT_TYPES_TO_EXTENSIONS: Record<string, string> = {
  "image/avif": "avif",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const SAFE_IMAGE_EXTENSIONS = new Set([
  "avif",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "webp",
]);

const R2_ENV_KEYS = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET",
  "R2_PUBLIC_URL",
] as const;

type R2EnvKey = (typeof R2_ENV_KEYS)[number];

type R2StorageConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicUrl: string;
};

type R2ConfigStatus =
  | {
      configured: true;
      hasAnyValue: true;
      missing: [];
    }
  | {
      configured: false;
      hasAnyValue: boolean;
      missing: R2EnvKey[];
    };

type R2ObjectKeyInput = {
  contentType?: string;
  filename?: string;
  folder: string;
  id?: string;
};

let cachedClient: S3Client | null = null;
let cachedClientSignature = "";

const readEnv = (key: R2EnvKey) => process.env[key]?.trim() ?? "";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/g, "");

export const getR2StorageStatus = (): R2ConfigStatus => {
  const values = R2_ENV_KEYS.map((key) => [key, readEnv(key)] as const);
  const missing = values
    .filter(([, value]) => !value)
    .map(([key]) => key) as R2EnvKey[];
  const hasAnyValue = values.some(([, value]) => Boolean(value));

  if (missing.length === 0) {
    return { configured: true, hasAnyValue: true, missing: [] };
  }

  return { configured: false, hasAnyValue, missing };
};

const getR2StorageConfig = (): R2StorageConfig | null => {
  if (!getR2StorageStatus().configured) return null;

  return {
    accountId: readEnv("R2_ACCOUNT_ID"),
    accessKeyId: readEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: readEnv("R2_SECRET_ACCESS_KEY"),
    bucket: readEnv("R2_BUCKET"),
    publicUrl: stripTrailingSlash(readEnv("R2_PUBLIC_URL")),
  };
};

const getR2Client = (config: R2StorageConfig) => {
  const signature = [
    config.accountId,
    config.accessKeyId,
    config.secretAccessKey,
  ].join(":");

  if (cachedClient && cachedClientSignature === signature) {
    return cachedClient;
  }

  cachedClient = new S3Client({
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    region: "auto",
  });
  cachedClientSignature = signature;

  return cachedClient;
};

const slugifySegment = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getSafeFileExtension = (filename = "", contentType = "") => {
  const mimeExtension = IMAGE_CONTENT_TYPES_TO_EXTENSIONS[contentType] ?? "";
  const filenameExtension = filename.split(".").pop()?.toLowerCase() ?? "";

  if (SAFE_IMAGE_EXTENSIONS.has(filenameExtension)) {
    return filenameExtension === "jpeg" ? "jpg" : filenameExtension;
  }

  return mimeExtension || "jpg";
};

export const buildR2ObjectKey = ({
  contentType,
  filename = "image",
  folder,
  id = randomUUID(),
}: R2ObjectKeyInput) => {
  const rawFilename = filename.split(/[\\/]/).pop() ?? "image";
  const basename = rawFilename.replace(/\.[^.]+$/g, "");
  const safeBasename = slugifySegment(basename).slice(0, 64) || "image";
  const safeFolder =
    folder
      .split("/")
      .map((segment) => slugifySegment(segment))
      .filter(Boolean)
      .join("/") || "uploads";
  const extension = getSafeFileExtension(rawFilename, contentType);

  return `${safeFolder}/${id}-${safeBasename}.${extension}`;
};

const buildPublicUrl = (publicUrl: string, key: string) => {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${publicUrl}/${encodedKey}`;
};

export const uploadImageToR2 = async (file: File, folder: string) => {
  const config = getR2StorageConfig();
  if (!config) {
    throw new Error("Cloudflare R2 storage is not configured.");
  }

  const key = buildR2ObjectKey({
    contentType: file.type,
    filename: file.name,
    folder,
  });
  const client = getR2Client(config);
  const body = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Body: body,
      Bucket: config.bucket,
      CacheControl: "public, max-age=31536000, immutable",
      ContentType: file.type || "application/octet-stream",
      Key: key,
    }),
  );

  return {
    key,
    url: buildPublicUrl(config.publicUrl, key),
  };
};
