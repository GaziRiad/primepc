"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Image from "next/image";
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

const FALLBACK_HERO = "/images/marketing1.jpg";
const FALLBACK_SIDE = "/images/marketing2.jpg";
const FALLBACK_DEAL_IMAGE = "/images/sutdy.png";

const emptyBanner = (href = "/products"): MarketingBanner => ({
  image: "",
  alt: "",
  href,
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
  const [heroSlides, setHeroSlides] = useState<MarketingBanner[]>(
    settings.heroSlides.length > 0 ? settings.heroSlides : [emptyBanner()],
  );
  const [sideBanners, setSideBanners] = useState<MarketingBanner[]>(() => {
    const initial = settings.sideBanners.slice(0, 2);
    while (initial.length < 2) initial.push(emptyBanner());
    return initial;
  });
  const [specialDeal, setSpecialDeal] = useState<SpecialDealSettings>(
    settings.specialDeal,
  );
  const [isSaving, setIsSaving] = useState(false);

  const activeHeroCount = useMemo(
    () =>
      heroSlides.filter((slide) => slide.isActive && slide.image.trim()).length,
    [heroSlides],
  );
  const activeSideCount = useMemo(
    () =>
      sideBanners.filter((banner) => banner.isActive && banner.image.trim())
        .length,
    [sideBanners],
  );

  const updateHeroSlide = (
    index: number,
    field: keyof MarketingBanner,
    value: string | boolean,
  ) => {
    setHeroSlides((current) =>
      current.map((slide, idx) =>
        idx === index ? { ...slide, [field]: value } : slide,
      ),
    );
  };

  const removeHeroSlide = (index: number) => {
    setHeroSlides((current) => {
      const next = current.filter((_, idx) => idx !== index);
      return next.length > 0 ? next : [emptyBanner()];
    });
  };

  const updateSideBanner = (
    index: number,
    field: keyof MarketingBanner,
    value: string | boolean,
  ) => {
    setSideBanners((current) =>
      current.map((banner, idx) =>
        idx === index ? { ...banner, [field]: value } : banner,
      ),
    );
  };

  const updateDeal = (
    field: keyof SpecialDealSettings,
    value: string | boolean,
  ) => {
    setSpecialDeal((current) => ({ ...current, [field]: value }));
  };

  const cleanBanner = (banner: MarketingBanner) => ({
    image: banner.image.trim(),
    alt: banner.alt.trim(),
    href: banner.href.trim(),
    isActive: banner.isActive,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanHeroSlides = heroSlides
      .map(cleanBanner)
      .filter((slide) => slide.image);
    const cleanSideBanners = sideBanners
      .map(cleanBanner)
      .filter((banner) => banner.image)
      .slice(0, 2);

    if (cleanHeroSlides.length === 0) {
      toast.error("Ajoutez au moins une diapositive au carrousel principal.");
      return;
    }

    if (!specialDeal.image.trim()) {
      toast.error("L’image de l’offre spéciale est obligatoire.");
      return;
    }

    if (
      !specialDeal.endsAt ||
      Number.isNaN(new Date(specialDeal.endsAt).getTime())
    ) {
      toast.error("Choisissez une date de fin valide.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/marketing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroSlides: cleanHeroSlides,
          sideBanners: cleanSideBanners,
          specialDeal,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        settings?: MarketingSettingsData;
      };

      if (!response.ok || !data.ok || !data.settings) {
        toast.error(
          data.error || "Impossible d’enregistrer les paramètres marketing.",
        );
        return;
      }

      setHeroSlides(data.settings.heroSlides);
      setSideBanners(() => {
        const next = data.settings?.sideBanners.slice(0, 2) ?? [];
        while (next.length < 2) next.push(emptyBanner());
        return next;
      });
      setSpecialDeal(data.settings.specialDeal);
      toast.success("Paramètres marketing enregistrés.");
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
              Carrousel principal
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Importez plusieurs diapositives pour le grand carrousel de la page
              d’accueil.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="gap-1.5"
            onClick={() =>
              setHeroSlides((current) => [...current, emptyBanner()])
            }
          >
            <Plus className="size-4" />
            Ajouter une diapositive
          </Button>
        </div>

        <div className="mt-6 space-y-5">
          {heroSlides.map((slide, index) => (
            <div
              key={`hero-slide-${index}`}
              className="grid gap-4 rounded-xl border p-4 lg:grid-cols-[18rem_1fr]"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl border bg-zinc-100">
                <Image
                  fill
                  src={slide.image || FALLBACK_HERO}
                  alt={slide.alt || `Diapositive ${index + 1} du carrousel`}
                  className="object-cover"
                  sizes="(min-width: 1024px) 288px, 100vw"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">
                    URL de l’image de la diapositive
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={slide.image}
                      onChange={(event) =>
                        updateHeroSlide(index, "image", event.target.value)
                      }
                      placeholder="/images/marketing1.jpg"
                    />
                    <ImageUploadButton
                      label="Importer la diapositive"
                      folder="primepc/marketing"
                      onUpload={(url) => updateHeroSlide(index, "image", url)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Texte alternatif
                  </label>
                  <Input
                    value={slide.alt}
                    onChange={(event) =>
                      updateHeroSlide(index, "alt", event.target.value)
                    }
                    placeholder="Courte description de l’image"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Lien au clic</label>
                  <Input
                    value={slide.href}
                    onChange={(event) =>
                      updateHeroSlide(index, "href", event.target.value)
                    }
                    placeholder="/products"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Checkbox
                      checked={slide.isActive}
                      onCheckedChange={(checked) =>
                        updateHeroSlide(index, "isActive", Boolean(checked))
                      }
                    />
                    Active
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => removeHeroSlide(index)}
                  >
                    <Trash2 className="size-4" />
                    Retirer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-4 text-xs">
          {activeHeroCount} diapositive{activeHeroCount === 1 ? "" : "s"} active
          {activeHeroCount === 1 ? "" : "s"} dans le grand carrousel.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-xs">
        <div>
          <h2 className="text-foreground text-lg font-semibold">
            Bannières latérales statiques
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Ces deux petits blocs de la page d’accueil sont des images
            statiques, pas un carrousel.
          </p>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {sideBanners.map((banner, index) => (
            <div key={`side-banner-${index}`} className="rounded-xl border p-4">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl border bg-zinc-100">
                <Image
                  fill
                  src={banner.image || FALLBACK_SIDE}
                  alt={banner.alt || `Bannière latérale ${index + 1}`}
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>

              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    URL de l’image de la bannière latérale {index + 1}
                  </label>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={banner.image}
                      onChange={(event) =>
                        updateSideBanner(index, "image", event.target.value)
                      }
                      placeholder="/images/marketing2.jpg"
                    />
                    <ImageUploadButton
                      label="Importer"
                      folder="primepc/marketing"
                      onUpload={(url) => updateSideBanner(index, "image", url)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Texte alternatif
                    </label>
                    <Input
                      value={banner.alt}
                      onChange={(event) =>
                        updateSideBanner(index, "alt", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Lien au clic</label>
                    <Input
                      value={banner.href}
                      onChange={(event) =>
                        updateSideBanner(index, "href", event.target.value)
                      }
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={banner.isActive}
                    onCheckedChange={(checked) =>
                      updateSideBanner(index, "isActive", Boolean(checked))
                    }
                  />
                  Active
                </label>
              </div>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-4 text-xs">
          {activeSideCount} bannière{activeSideCount === 1 ? "" : "s"} latérale
          {activeSideCount === 1 ? " apparaîtra" : "s apparaîtront"} à côté du
          carrousel sur ordinateur.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Minuteur de l’offre spéciale
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Gérez le bloc promotionnel situé vers le bas de la page d’accueil.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox
              checked={specialDeal.enabled}
              onCheckedChange={(checked) =>
                updateDeal("enabled", Boolean(checked))
              }
            />
            Activée
          </label>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Surtitre</label>
              <Input
                value={specialDeal.eyebrow}
                onChange={(event) => updateDeal("eyebrow", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Libellé du bouton</label>
              <Input
                value={specialDeal.ctaLabel}
                onChange={(event) => updateDeal("ctaLabel", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Titre</label>
              <Input
                value={specialDeal.title}
                onChange={(event) => updateDeal("title", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sous-titre</label>
              <Input
                value={specialDeal.subtitle}
                onChange={(event) => updateDeal("subtitle", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lien du bouton</label>
              <Input
                value={specialDeal.href}
                onChange={(event) => updateDeal("href", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date de fin</label>
              <Input
                type="datetime-local"
                value={toDateTimeLocal(specialDeal.endsAt)}
                onChange={(event) =>
                  updateDeal("endsAt", fromDateTimeLocal(event.target.value))
                }
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">URL de l’image</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={specialDeal.image}
                  onChange={(event) => updateDeal("image", event.target.value)}
                />
                <ImageUploadButton
                  label="Importer l’image de l’offre"
                  folder="primepc/marketing"
                  onUpload={(url) => updateDeal("image", url)}
                />
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-zinc-100">
            <Image
              fill
              src={specialDeal.image || FALLBACK_DEAL_IMAGE}
              alt={specialDeal.subtitle || "Aperçu de l’offre spéciale"}
              className="object-contain"
              sizes="(min-width: 1024px) 288px, 100vw"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Enregistrement..." : "Enregistrer le marketing"}
        </Button>
      </div>
    </form>
  );
}
