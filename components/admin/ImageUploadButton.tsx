"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type ImageUploadButtonProps = {
  onUpload: (url: string) => void;
  label?: string;
  folder?: string;
};

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function ImageUploadButton({
  onUpload,
  label = "Upload",
  folder = "primepc/products",
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const isConfigured = Boolean(cloudName && uploadPreset);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary upload is not configured.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    if (folder) formData.append("folder", folder);

    setIsUploading(true);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = (await response.json().catch(() => ({}))) as {
        secure_url?: string;
        error?: { message?: string };
      };

      if (!response.ok || !data.secure_url) {
        toast.error(data.error?.message || "Unable to upload image.");
        return;
      }

      onUpload(data.secure_url);
      toast.success("Image uploaded.");
    } catch {
      toast.error("Unable to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        className="gap-1.5"
        disabled={!isConfigured || isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Spinner className="size-4" />
        ) : (
          <Upload className="size-4" />
        )}
        {isUploading ? "Uploading..." : label}
      </Button>
    </>
  );
}
