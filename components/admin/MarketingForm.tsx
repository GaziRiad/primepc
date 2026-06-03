/* eslint-disable @next/next/no-img-element */
"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ImageUploadButton from "@/components/admin/ImageUploadButton";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type {
  MarketingBanner,
  MarketingSettingsData,
  SpecialDealSettings,
} from "@/types/marketing";

const FALLBACK_BANNER = "/images/marketing1.jpg";
const FALLBACK_DEAL_IMAGE = "/images/sutdy.png";

const emptyBanner = (): MarketingBanner => ({
  image: "",
  alt: "",
  href: "/products",
  isActive: true,
});

const toDateTimeLocal = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
};

const fromDateTimeLocal = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

type MarketingFormProps = {
  settings: MarketingSettingsData;
};

export default function MarketingForm({ settings }: MarketingFormProps) {
  const router = useRouter();
  const [banners, setBanners] = useState<MarketingBanner[]>(
    settings.banners.length > 0 ? settings.banners : [emptyBanner()],
  );
  const [specialDeal, setSpecialDeal] = useState<SpecialDealSettings>(
    settings.specialDeal,
  );
  const [isSaving, setIsSaving] = useState(false);

  const activeBannerCount = useMemo(
    () => banners.filter((banner) => banner.isActive && banner.image).length,
    [banners],
  );

  const updateBanner = (
    index: number,
    field: keyof MarketingBanner,
    value: string | boolean,
  ) => {
    setBanners((current) =>
      current.map((banner, idx) =>
        idx === index ? { ...banner, [field]: value } : banner,
      ),
    );
  };

  const removeBanner = (index: number) => {
    setBanners((current) => {
      const next = current.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : [emptyBanner()];
    });
  };

  const updateDeal = (
    field: keyof SpecialDealSettings,
    value: string | boolean,
  ) => {
    setSpecialDeal((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanBanners = banners
      .map((banner) => ({
        image: banner.image.trim(),
        alt: banner.alt.trim(),
        href: banner.href.trim(),
        isActive: banner.isActive,
      }))
      .filter((banner) => banner.image);

    if (cleanBanners.length === 0) {
      toast.error("Add at least one banner image.");
      return;
    }

    if (!specialDeal.image.trim()) {
      toast.error("Special deal image is required.");
      return;
    }

    if (!specialDeal.endsAt || Number.isNaN(new Date(specialDeal.endsAt).getTime())) {
      toast.error("Choose a valid deal end date.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/marketing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banners: cleanBanners,
          specialDeal,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        settings?: MarketingSettingsData;
      };

      if (!response.ok || !data.ok || !data.settings) {
        toast.error(data.error || "Unable to save marketing settings.");
        return;
      }

      setBanners(data.settings.banners);
      setSpecialDeal(data.settings.specialDeal);
      toast.success("Marketing settings saved.");
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Homepage banners
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage the carousel and side banners at the top of the homepage.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={() => setBanners((current) => [...current, emptyBanner()])}
          >
            <Plus className="size-4" />
            Add banner
          </Button>
        </div>

        <div className="mt-6 space-y-5">
          {banners.map((banner, index) => (
            <div
              key={`banner-${index}`}
              className="grid gap-4 rounded-xl border p-4 lg:grid-cols-[16rem_1fr]"
            >
              <div className="overflow-hidden rounded-xl border bg-zinc-100">
                <img
                  src={banner.image || FALLBACK_BANNER}
                  alt={banner.alt || `Banner ${index + 1}`}
                  className="aspect-video w-full object-cover"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={banner.image}
                      onChange={(event) =>
                        updateBanner(index, "image", event.target.value)
                      }
                      placeholder="/images/marketing1.jpg"
                    />
                    <ImageUploadButton
                      label="Upload"
                      folder="primepc/marketing"
                      onUpload={(url) => updateBanner(index, "image", url)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Alt text</label>
                  <Input
                    value={banner.alt}
                    onChange={(event) =>
                      updateBanner(index, "alt", event.target.value)
                    }
                    placeholder="Short image description"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Click link</label>
                  <Input
                    value={banner.href}
                    onChange={(event) =>
                      updateBanner(index, "href", event.target.value)
                    }
                    placeholder="/products"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      checked={banner.isActive}
                      onCheckedChange={(checked) =>
                        updateBanner(index, "isActive", Boolean(checked))
                      }
                    />
                    Active
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => removeBanner(index)}
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-4 text-xs">
          {activeBannerCount} active banner
          {activeBannerCount === 1 ? "" : "s"} will appear on the homepage.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Special deal timer
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Control the promotional block near the bottom of the homepage.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={specialDeal.enabled}
              onCheckedChange={(checked) =>
                updateDeal("enabled", Boolean(checked))
              }
            />
            Enabled
          </label>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Eyebrow</label>
              <Input
                value={specialDeal.eyebrow}
                onChange={(event) => updateDeal("eyebrow", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CTA label</label>
              <Input
                value={specialDeal.ctaLabel}
                onChange={(event) =>
                  updateDeal("ctaLabel", event.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={specialDeal.title}
                onChange={(event) => updateDeal("title", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subtitle</label>
              <Input
                value={specialDeal.subtitle}
                onChange={(event) => updateDeal("subtitle", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CTA link</label>
              <Input
                value={specialDeal.href}
                onChange={(event) => updateDeal("href", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ends at</label>
              <Input
                type="datetime-local"
                value={toDateTimeLocal(specialDeal.endsAt)}
                onChange={(event) =>
                  updateDeal("endsAt", fromDateTimeLocal(event.target.value))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Image URL</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={specialDeal.image}
                  onChange={(event) => updateDeal("image", event.target.value)}
                />
                <ImageUploadButton
                  label="Upload deal image"
                  folder="primepc/marketing"
                  onUpload={(url) => updateDeal("image", url)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-zinc-100">
            <img
              src={specialDeal.image || FALLBACK_DEAL_IMAGE}
              alt={specialDeal.subtitle || "Special deal preview"}
              className="aspect-[4/3] w-full object-contain"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save marketing"}
        </Button>
      </div>
    </form>
  );
}
