"use client";

import { CldUploadWidget } from "next-cloudinary";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

type ImageUploadButtonProps = {
  onUpload: (url: string) => void;
  label?: string;
  folder?: string;
};

const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function ImageUploadButton({
  onUpload,
  label = "Upload",
  folder = "primepc/products",
}: ImageUploadButtonProps) {
  if (!uploadPreset) {
    return (
      <Button type="button" variant="outline" disabled>
        {label}
      </Button>
    );
  }

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      options={{
        sources: ["local", "url", "camera"],
        multiple: false,
        folder,
      }}
      onSuccess={(result) => {
        const info =
          typeof result?.info === "object" && result.info ? result.info : null;
        const secureUrl =
          info &&
          typeof (info as { secure_url?: unknown }).secure_url === "string"
            ? ((info as { secure_url: string }).secure_url as string)
            : "";

        if (secureUrl) {
          onUpload(secureUrl);
        }
      }}
    >
      {({ open }) => (
        <Button
          type="button"
          variant="outline"
          className="gap-1.5"
          onClick={() => open()}
        >
          <Upload className="size-4" />
          {label}
        </Button>
      )}
    </CldUploadWidget>
  );
}
