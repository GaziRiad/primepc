"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

const FALLBACK_IMAGE = "/images/accessories.png";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const gallery = useMemo(() => {
    const cleaned = (images ?? [])
      .map((image) => image.trim())
      .filter((image) => image.length > 0);
    return cleaned.length > 0 ? cleaned : [FALLBACK_IMAGE];
  }, [images]);

  const thumbnails = gallery.slice(0, 5);

  const [activeIndex, setActiveIndex] = useState(0);

  const safeIndex = activeIndex >= gallery.length ? 0 : activeIndex;
  const activeImage = gallery[safeIndex] ?? gallery[0];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-xs">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-zinc-100 p-6">
        <Image
          fill
          src={activeImage}
          alt={`Image of ${productName} from PRIMEPC algeria.`}
          className="object-contain"
        />
      </div>

      {thumbnails.length > 1 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {thumbnails.map((thumb, index) => {
            const isActive = index === safeIndex;

            return (
              <li key={`thumb-${index}`}>
                <button
                  type="button"
                  aria-label={`View image ${index + 1} for ${productName}`}
                  aria-pressed={isActive}
                  onClick={() => setActiveIndex(index)}
                  className={`relative aspect-square w-full overflow-hidden rounded-lg border bg-white transition ${
                    isActive
                      ? "border-primary/40 ring-primary/40 ring-2"
                      : "hover:border-primary/30"
                  }`}
                >
                  <Image
                    fill
                    src={thumb}
                    alt={`Thumbnail ${index + 1} of ${productName}`}
                    className="object-contain"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
