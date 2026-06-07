"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type ProductInfoTabsProps = {
  brand: string;
  categories: string[];
  description: string;
  specs: Array<[string, string]>;
  stockLabel: string;
};

type TabId = "description" | "additional" | "reviews";

const tabs: Array<{ id: TabId; label: string }> = [
  { id: "description", label: "Description" },
  { id: "additional", label: "Informations complémentaires" },
  { id: "reviews", label: "Avis" },
];

const formatSpecLabel = (label: string) =>
  label.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-accent-400">{label}</dt>
      <dd className="text-foreground font-medium sm:text-right">{value}</dd>
    </div>
  );
}

export default function ProductInfoTabs({
  brand,
  categories,
  description,
  specs,
  stockLabel,
}: ProductInfoTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  return (
    <div className="mt-14 rounded-2xl border bg-white shadow-xs">
      <div
        role="tablist"
        aria-label="Détails du produit"
        className="flex gap-2 overflow-x-auto border-b px-4 py-3 text-sm sm:px-6 sm:text-base"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`${tab.id}-tab`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "focus-visible:ring-primary/35 shrink-0 rounded-full px-4 py-2 font-semibold transition outline-none focus-visible:ring-2",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-accent-400 hover:bg-accent-100 hover:text-primary",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {activeTab === "description" && (
          <section
            id="description-panel"
            role="tabpanel"
            aria-labelledby="description-tab"
          >
            <h2 className="text-foreground text-xl font-semibold">
              Description
            </h2>
            <div
              className="product-rich-text text-accent-500 mt-4 max-w-4xl"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </section>
        )}

        {activeTab === "additional" && (
          <section
            id="additional-panel"
            role="tabpanel"
            aria-labelledby="additional-tab"
          >
            <h2 className="text-foreground text-xl font-semibold">
              Informations complémentaires
            </h2>
            <dl className="mt-5 grid gap-4 text-base">
              <InfoRow label="Marque" value={brand} />
              <InfoRow label="Stock" value={stockLabel} />
              <InfoRow
                label="Catégories"
                value={
                  categories.length > 0
                    ? categories.join(", ")
                    : "Sans catégorie"
                }
              />
            </dl>

            {specs.length > 0 && (
              <div className="mt-8">
                <h3 className="text-accent-400 text-sm font-semibold tracking-wide uppercase">
                  Specifications
                </h3>
                <dl className="mt-4 grid gap-4 text-base">
                  {specs.map(([label, value]) => (
                    <InfoRow
                      key={label}
                      label={formatSpecLabel(label)}
                      value={value}
                    />
                  ))}
                </dl>
              </div>
            )}
          </section>
        )}

        {activeTab === "reviews" && (
          <section
            id="reviews-panel"
            role="tabpanel"
            aria-labelledby="reviews-tab"
          >
            <h2 className="text-foreground text-xl font-semibold">Avis</h2>
            <p className="text-accent-500 mt-4 text-base leading-7">
              Aucun avis pour le moment. Soyez le premier à partager votre
              expérience.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
