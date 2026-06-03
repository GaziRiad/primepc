import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import startDbConnection from "@/lib/db";
import {
  DEFAULT_MARKETING_SETTINGS,
  normalizeMarketingSettings,
} from "@/lib/marketing";
import MarketingSettings from "@/models/MarketingSettings";
import type { MarketingSettingsData } from "@/types/marketing";

const MAX_BANNERS = 6;

const normalizeText = (value: unknown, maxLength: number) =>
  String(value ?? "")
    .trim()
    .slice(0, maxLength);

const parseMarketingPayload = async (request: Request) => {
  let body: Partial<MarketingSettingsData> = {};

  try {
    body = (await request.json()) as Partial<MarketingSettingsData>;
  } catch {
    return { ok: false as const, error: "invalid_payload" };
  }

  const rawBanners = Array.isArray(body.banners) ? body.banners : [];
  const banners = rawBanners
    .slice(0, MAX_BANNERS)
    .map((banner) => ({
      image: normalizeText(banner?.image, 500),
      alt: normalizeText(banner?.alt, 160) || "PRIMEPC marketing banner",
      href: normalizeText(banner?.href, 300),
      isActive: banner?.isActive !== false,
    }))
    .filter((banner) => banner.image);

  const deal = body.specialDeal ?? DEFAULT_MARKETING_SETTINGS.specialDeal;
  const endsAt = new Date(deal.endsAt);

  if (banners.length === 0) {
    return { ok: false as const, error: "banner_required" };
  }

  if (Number.isNaN(endsAt.getTime())) {
    return { ok: false as const, error: "invalid_deal_date" };
  }

  const settings = normalizeMarketingSettings({
    banners,
    specialDeal: {
      enabled: deal.enabled !== false,
      eyebrow: normalizeText(deal.eyebrow, 80),
      title: normalizeText(deal.title, 120),
      subtitle: normalizeText(deal.subtitle, 160),
      image: normalizeText(deal.image, 500),
      href: normalizeText(deal.href, 300),
      ctaLabel: normalizeText(deal.ctaLabel, 80),
      endsAt: endsAt.toISOString(),
    },
  });

  return { ok: true as const, settings };
};

export async function PATCH(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const parsed = await parseMarketingPayload(request);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error },
      { status: 400 },
    );
  }

  await startDbConnection();

  const saved = await MarketingSettings.findOneAndUpdate(
    { key: "homepage" },
    {
      key: "homepage",
      banners: parsed.settings.banners,
      specialDeal: {
        ...parsed.settings.specialDeal,
        endsAt: new Date(parsed.settings.specialDeal.endsAt),
      },
    },
    { returnDocument: "after", upsert: true, runValidators: true },
  ).lean();

  return NextResponse.json({
    ok: true,
    settings: normalizeMarketingSettings(
      saved as Partial<MarketingSettingsData>,
    ),
  });
}
