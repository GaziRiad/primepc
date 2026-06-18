"use client";

import { useId, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type ImageUploadButtonProps = {
  onUpload: (url: string) => void;
  label?: string;
  folder?: string;
};

export default function ImageUploadButton({
  onUpload,
  label = "Importer",
  folder = "primepc/products",
}: ImageUploadButtonProps) {
  const inputId = useId();
  const [isUploading, setIsUploading] = useState(false);
  const isDisabled = isUploading;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez choisir un fichier image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (folder) formData.append("folder", folder);

    setIsUploading(true);

    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.ok || !data.url) {
        toast.error(data.error || "Impossible d’importer l’image.");
        return;
      }

      onUpload(data.url);
      toast.success("Image importée.");
    } catch {
      toast.error("Impossible d’importer l’image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <label
      htmlFor={inputId}
      aria-disabled={isDisabled}
      className={cn(
        buttonVariants({ variant: "outline" }),
        "relative gap-1.5 overflow-hidden",
        isDisabled && "pointer-events-none opacity-50",
      )}
    >
      <input
        id={inputId}
        type="file"
        accept="image/*"
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        disabled={isDisabled}
        onChange={handleFileChange}
      />
      {isUploading ? (
        <Spinner className="size-4" />
      ) : (
        <Upload className="size-4" />
      )}
      {isUploading ? "Importation..." : label}
    </label>
  );
}
