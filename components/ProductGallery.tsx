"use client";

import { Maximize2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useProductVariationImage } from "@/components/ProductVariationImageContext";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";

const FALLBACK_IMAGE = "/images/accessories.png";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const variationImage = useProductVariationImage();
  const [failedImages, setFailedImages] = useState<Set<string>>(
    () => new Set(),
  );
  const gallery = useMemo(() => {
    const cleaned = (images ?? [])
      .map((image) => image.trim())
      .filter((image) => image.length > 0 && !failedImages.has(image));
    return cleaned.length > 0 ? cleaned : [FALLBACK_IMAGE];
  }, [failedImages, images]);

  const slides = useMemo(
    () =>
      gallery.map((src, index) => ({
        src,
        alt: `${productName} image ${index + 1}`,
        thumbnail: src,
      })),
    [gallery, productName],
  );

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const selectedIndex = gallery.indexOf(variationImage?.selectedImage ?? "");
  const safeIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const activeImage = gallery[safeIndex] ?? gallery[0];

  const markImageFailed = (image: string) => {
    if (image === FALLBACK_IMAGE) return;

    setFailedImages((current) => {
      if (current.has(image)) return current;
      const next = new Set(current);
      next.add(image);
      return next;
    });
  };

  const isRemoteImage = (image: string) => /^https?:\/\//i.test(image);

  const selectImage = (index: number) => {
    const image = gallery[index];
    if (image) variationImage?.setSelectedImage(image);
  };

  const openPreview = (index: number) => {
    selectImage(index);
    setLightboxOpen(true);
  };

  return (
    <div className="rounded-2xl border bg-white p-3 shadow-xs sm:p-4 lg:sticky lg:top-28">
      <div
        className={cn(
          "grid gap-4",
          gallery.length > 1
            ? "lg:grid-cols-[6.5rem_minmax(0,1fr)] lg:items-start xl:grid-cols-[7rem_minmax(0,1fr)]"
            : "lg:grid-cols-1",
        )}
      >
        {gallery.length > 1 && (
          <ul className="order-2 flex gap-2 overflow-x-auto pb-1 sm:gap-3 lg:order-1 lg:h-[clamp(23rem,38vw,34rem)] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pr-1 lg:pb-0 lg:[scrollbar-width:thin]">
            {gallery.map((thumb, index) => {
              const isActive = index === safeIndex;

              return (
                <li
                  key={`thumb-${index}`}
                  className="w-20 shrink-0 sm:w-24 lg:w-full"
                >
                  <button
                    type="button"
                    aria-label={`Voir l’image ${index + 1} de ${productName}`}
                    aria-pressed={isActive}
                    onClick={() => selectImage(index)}
                    className={`relative aspect-square w-full overflow-hidden rounded-xl border bg-white transition ${
                      isActive
                        ? "border-primary/50 ring-primary/30 ring-2"
                        : "hover:border-primary/30 border-slate-100"
                    }`}
                  >
                    <Image
                      fill
                      src={thumb}
                      alt={`Miniature ${index + 1} de ${productName}`}
                      className="object-cover"
                      unoptimized={isRemoteImage(thumb)}
                      onError={() => markImageFailed(thumb)}
                      sizes="(min-width: 1280px) 128px, (min-width: 1024px) 112px, 20vw"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={() => openPreview(safeIndex)}
          aria-label={`Aperçu de l’image de ${productName}`}
          className="group relative order-1 aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-xl bg-zinc-100 lg:order-2 lg:aspect-auto lg:h-[clamp(23rem,38vw,34rem)]"
        >
          <Image
            fill
            priority
            src={activeImage}
            alt={`Image de ${productName} sur PRIMEPC Algérie.`}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.015]"
            unoptimized={isRemoteImage(activeImage)}
            onError={() => markImageFailed(activeImage)}
            sizes="(min-width: 1280px) 680px, (min-width: 1024px) 54vw, 100vw"
          />
          <span className="absolute right-4 bottom-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-slate-800 opacity-0 shadow-sm transition group-hover:opacity-100">
            <Maximize2 className="size-5" />
          </span>
        </button>
      </div>

      <div className="text-accent-400 mt-4 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
        <span>
          {gallery.length} image{gallery.length === 1 ? "" : "s"} du produit
        </span>
        <button
          type="button"
          onClick={() => openPreview(safeIndex)}
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Voir toutes les photos ({safeIndex + 1} sur {gallery.length})
        </button>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={safeIndex}
        slides={slides}
        plugins={[Counter, Thumbnails, Zoom]}
        animation={{ fade: 220, swipe: 260 }}
        carousel={{
          finite: gallery.length <= 1,
          imageFit: "contain",
          padding: "24px",
          preload: 2,
          spacing: "10%",
        }}
        controller={{ closeOnBackdropClick: true }}
        counter={{ separator: " of " }}
        thumbnails={{
          border: 0,
          borderRadius: 12,
          gap: 12,
          height: 74,
          imageFit: "cover",
          padding: 0,
          showToggle: true,
          vignette: true,
          width: 96,
        }}
        zoom={{
          maxZoomPixelRatio: 2,
          scrollToZoom: true,
          zoomInMultiplier: 1.8,
        }}
        on={{
          view: ({ index }) => selectImage(index),
        }}
        styles={{
          container: { backgroundColor: "rgba(8, 10, 14, 0.86)" },
          slide: { padding: "0 12px" },
        }}
      />
    </div>
  );
}
