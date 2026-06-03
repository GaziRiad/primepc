import MarketingForm from "@/components/admin/MarketingForm";
import { getOrCreateMarketingSettings } from "@/lib/marketing";

export default async function page() {
  const settings = await getOrCreateMarketingSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">Marketing</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Control homepage banners and the timed special deal.
        </p>
      </div>

      <MarketingForm settings={settings} />
    </div>
  );
}
