import MarketingForm from "@/components/admin/MarketingForm";
import { getOrCreateMarketingSettings } from "@/lib/marketing";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/adminAuth";

export const metadata: Metadata = {
  title: "Marketing - Administration",
};

export default async function page() {
  await requireAdmin();
  const settings = await getOrCreateMarketingSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Marketing</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Gérez les bannières de la page d’accueil et l’offre spéciale
          programmée.
        </p>
      </div>

      <MarketingForm settings={settings} />
    </div>
  );
}
