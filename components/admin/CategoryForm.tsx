/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import slugify from "slugify";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUploadButton from "@/components/admin/ImageUploadButton";

const FALLBACK_IMAGE = "/images/accessories.png";

const slugFromName = (value: string) =>
  slugify(value, { lower: true, strict: true, trim: true });

type CategoryFormCategory = {
  _id: string;
  name: string;
  slug?: string;
  image?: string;
  isActive?: boolean;
};

type CategoryFormProps = {
  mode: "create" | "edit";
  category?: CategoryFormCategory;
};

export default function CategoryForm({ mode, category }: CategoryFormProps) {
  const router = useRouter();

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const autoSlug = useMemo(() => slugFromName(name), [name]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nameValue = name.trim();
    const imageValue = image.trim();
    const slugValue = slug.trim();

    if (!nameValue) {
      toast.error("Category name is required.");
      return;
    }

    if (!imageValue) {
      toast.error("Category image is required.");
      return;
    }

    const payload: Record<string, unknown> = {
      name: nameValue,
      image: imageValue,
      isActive,
    };

    if (slugValue) {
      payload.slug = slugValue;
    }

    setIsSaving(true);
    try {
      const endpoint =
        mode === "create"
          ? "/api/admin/categories"
          : `/api/admin/categories/${category?._id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        toast.error(data?.error || "Unable to save category.");
        return;
      }

      toast.success(
        mode === "create" ? "Category created." : "Category updated.",
      );
      router.push("/admin/categories");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-xs">
        <h2 className="text-foreground text-lg font-semibold">
          Category details
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Name, slug, and image used across the storefront.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Slug (optional)</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={autoSlug || "auto-generated"}
            />
            <p className="text-muted-foreground text-xs">
              Leave blank to use: {autoSlug || "auto-generated"}
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <label className="text-sm font-medium">Image</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Paste image URL"
            />
            <ImageUploadButton
              label="Upload image"
              folder="primepc/categories"
              onUpload={(url) => setImage(url)}
            />
          </div>
          <div className="overflow-hidden rounded-2xl border bg-zinc-100">
            <img
              src={image || FALLBACK_IMAGE}
              alt={name || "Category preview"}
              className="h-48 w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Checkbox
            checked={isActive}
            onCheckedChange={(value) => setIsActive(Boolean(value))}
          />
          <span className="text-sm">Category is active</span>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" asChild>
          <Link href="/admin/categories">Cancel</Link>
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving
            ? "Saving..."
            : mode === "create"
              ? "Create category"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
