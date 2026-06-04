"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
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

type CloudinaryUploadResult = {
  event?: string;
  info?: string | { secure_url?: string };
};

type CloudinaryUploadWidget = {
  destroy?: () => void;
  open: () => void;
};

type CloudinaryWindow = Window & {
  cloudinary?: {
    createUploadWidget: (
      options: Record<string, unknown>,
      callback: (
        error: { message?: string } | string | null,
        result: unknown,
      ) => void,
    ) => CloudinaryUploadWidget;
  };
};

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const widgetUploadMaxBytes = 8 * 1024 * 1024;
const widgetScriptId = "cloudinary-upload-widget-script";
const widgetScriptSrc = "https://upload-widget.cloudinary.com/global/all.js";

const getUploadedUrl = (results: CloudinaryUploadResult) => {
  const info = results.info;

  if (!info || typeof info === "string") return "";
  return typeof info.secure_url === "string" ? info.secure_url : "";
};

const loadCloudinaryWidgetScript = () =>
  new Promise<void>((resolve, reject) => {
    const cloudinaryWindow = window as CloudinaryWindow;
    if (cloudinaryWindow.cloudinary?.createUploadWidget) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(widgetScriptId);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Cloudinary upload window.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = widgetScriptId;
    script.src = widgetScriptSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load Cloudinary upload window."));
    document.body.appendChild(script);
  });

export default function ImageUploadButton({
  onUpload,
  label = "Upload",
  folder = "primepc/products",
}: ImageUploadButtonProps) {
  if (cloudName && uploadPreset) {
    return (
      <CloudinaryWidgetButton
        onUpload={onUpload}
        label={label}
        folder={folder}
      />
    );
  }

  return (
    <FallbackUploadButton onUpload={onUpload} label={label} folder={folder} />
  );
}

function CloudinaryWidgetButton({
  onUpload,
  label = "Upload",
  folder = "primepc/products",
}: ImageUploadButtonProps) {
  const widgetRef = useRef<CloudinaryUploadWidget | null>(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    return () => {
      widgetRef.current?.destroy?.();
      widgetRef.current = null;
    };
  }, []);

  const openWidget = useCallback(async () => {
    if (!cloudName || !uploadPreset) return;

    setIsOpening(true);

    try {
      await loadCloudinaryWidgetScript();

      const cloudinaryWindow = window as CloudinaryWindow;
      if (!cloudinaryWindow.cloudinary?.createUploadWidget) {
        toast.error("Unable to open Cloudinary upload window.");
        return;
      }

      if (!widgetRef.current) {
        widgetRef.current = cloudinaryWindow.cloudinary.createUploadWidget(
          {
            cloudName,
            uploadPreset,
            folder,
            resourceType: "image",
            multiple: false,
            maxFiles: 1,
            maxFileSize: widgetUploadMaxBytes,
            clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif", "avif"],
            sources: ["local", "camera", "url"],
            showAdvancedOptions: false,
            showPoweredBy: false,
            singleUploadAutoClose: true,
          },
          (error, result) => {
            if (error) {
              const message = typeof error === "string" ? error : error.message;
              toast.error(message || "Unable to upload image.");
              return;
            }

            const uploadResult = result as CloudinaryUploadResult;
            if (uploadResult.event !== "success") return;

            const url = getUploadedUrl(uploadResult);
            if (!url) {
              toast.error("Upload finished, but no image URL was returned.");
              return;
            }

            onUpload(url);
            toast.success("Image uploaded.");
          },
        );
      }

      widgetRef.current.open();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open Cloudinary upload window.",
      );
    } finally {
      setIsOpening(false);
    }
  }, [folder, onUpload]);

  return (
    <button
      type="button"
      className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
      disabled={isOpening}
      onClick={(event) => {
        event.preventDefault();
        void openWidget();
      }}
    >
      {isOpening ? (
        <Spinner className="size-4" />
      ) : (
        <Upload className="size-4" />
      )}
      {isOpening ? "Opening..." : label}
    </button>
  );
}

function FallbackUploadButton({
  onUpload,
  label = "Upload",
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
      toast.error("Please choose an image file.");
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
        toast.error(data.error || "Unable to upload image.");
        return;
      }

      onUpload(data.url);
      toast.success("Image uploaded.");
    } catch {
      toast.error("Unable to upload image.");
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
      {isUploading ? "Uploading..." : label}
    </label>
  );
}
