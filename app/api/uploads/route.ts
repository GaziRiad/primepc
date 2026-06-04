import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

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

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "Please sign in before uploading images." },
      { status: 401 },
    );
  }

  const { cloudName, uploadPreset } = getCloudinaryConfig();
  if (!cloudName || !uploadPreset) {
    return NextResponse.json(
      { ok: false, error: "Cloudinary upload is not configured." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid upload payload." },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  const folder = cleanFolder(formData.get("folder"));

  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Please choose an image file." },
      { status: 400 },
    );
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { ok: false, error: "Only image uploads are allowed." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { ok: false, error: "Image must be smaller than 8MB." },
      { status: 400 },
    );
  }

  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json(
      { ok: false, error: "Invalid upload folder." },
      { status: 400 },
    );
  }

  if (folder !== "primepc/users" && session.user.role !== "admin") {
    return NextResponse.json(
      { ok: false, error: "You do not have permission to upload here." },
      { status: 403 },
    );
  }

  const uploadData = new FormData();
  uploadData.append("file", file, file.name);
  uploadData.append("upload_preset", uploadPreset);
  uploadData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: uploadData,
    },
  );

  const data = (await response.json().catch(() => ({}))) as {
    secure_url?: string;
    error?: { message?: string };
  };

  if (!response.ok || !data.secure_url) {
    return NextResponse.json(
      {
        ok: false,
        error: data.error?.message || "Unable to upload image.",
      },
      { status: response.ok ? 502 : response.status },
    );
  }

  return NextResponse.json({ ok: true, url: data.secure_url });
}
