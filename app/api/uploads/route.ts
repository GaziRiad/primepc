import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getR2StorageStatus, uploadImageToR2 } from "@/lib/r2Storage";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_FOLDERS = new Set([
  "primepc/products",
  "primepc/categories",
  "primepc/marketing",
  "primepc/users",
]);

const getCloudinaryConfig = () => ({
  cloudName:
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset:
    process.env.CLOUDINARY_UPLOAD_PRESET ??
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
});

const cleanFolder = (value: FormDataEntryValue | null) => {
  if (typeof value !== "string") return "primepc/products";
  return value.trim().replace(/^\/+|\/+$/g, "") || "primepc/products";
};

const uploadImageToCloudinary = async (
  file: File,
  folder: string,
  cloudName: string,
  uploadPreset: string,
) => {
  const uploadData = new FormData();
  uploadData.append("file", file, file.name);
  uploadData.append("upload_preset", uploadPreset);
  uploadData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      body: uploadData,
      method: "POST",
    },
  );

  const data = (await response.json().catch(() => ({}))) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.secure_url) {
    return {
      error: data.error?.message || "Impossible d'importer l'image.",
      status: response.ok ? 502 : response.status,
      url: "",
    };
  }

  return { error: "", status: 200, url: data.secure_url };
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        ok: false,
        error: "Veuillez vous connecter avant d'importer des images.",
      },
      { status: 401 },
    );
  }

  const uploadLimit = await consumeRateLimit(request, {
    identifier: session.user.id,
    limit: session.user.role === "admin" ? 150 : 20,
    scope: `uploads:${session.user.role === "admin" ? "admin" : "user"}`,
    windowMs: 60 * 60 * 1000,
  });

  if (!uploadLimit.allowed) {
    return rateLimitResponse(
      uploadLimit,
      "Trop de televersements. Veuillez reessayer plus tard.",
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Donnees d'importation invalides." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const folder = cleanFolder(formData.get("folder"));

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Veuillez choisir un fichier image." },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, error: "Seules les images peuvent etre importees." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { ok: false, error: "L'image doit peser moins de 8 Mo." },
      { status: 400 },
    );
  }

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json(
      { ok: false, error: "Dossier d'importation invalide." },
      { status: 400 },
    );
  }

  if (folder !== "primepc/users" && session.user.role !== "admin") {
    return NextResponse.json(
      {
        ok: false,
        error: "Vous n'avez pas l'autorisation d'importer une image ici.",
      },
      { status: 403 },
    );
  }

  const r2Status = getR2StorageStatus();
  if (r2Status.configured) {
    try {
      const upload = await uploadImageToR2(file, folder);
      return NextResponse.json({
        ok: true,
        provider: "cloudflare-r2",
        url: upload.url,
      });
    } catch (error) {
      console.error("Cloudflare R2 upload failed", error);
      return NextResponse.json(
        {
          ok: false,
          error: "Impossible d'importer l'image vers Cloudflare R2.",
        },
        { status: 502 },
      );
    }
  }

  if (r2Status.hasAnyValue) {
    return NextResponse.json(
      {
        ok: false,
        error: `Configuration Cloudflare R2 incomplete: ${r2Status.missing.join(
          ", ",
        )}.`,
      },
      { status: 500 },
    );
  }

  const { cloudName, uploadPreset } = getCloudinaryConfig();
  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      { ok: false, error: "Aucun stockage d'image n'est configure." },
      { status: 500 },
    );
  }

  const cloudinaryUpload = await uploadImageToCloudinary(
    file,
    folder,
    cloudName,
    uploadPreset,
  );

  if (!cloudinaryUpload.url) {
    return NextResponse.json(
      {
        ok: false,
        error: cloudinaryUpload.error,
      },
      { status: cloudinaryUpload.status },
    );
  }

  return NextResponse.json({
    ok: true,
    provider: "cloudinary",
    url: cloudinaryUpload.url,
  });
}
