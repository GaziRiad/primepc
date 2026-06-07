export const SITE_NAME = "PRIMEPC";
export const DEFAULT_SITE_URL = "https://primepcdz.com";

export const normalizeSiteUrl = (value?: string) => {
  const configured = String(value ?? "").trim();
  if (!configured) return DEFAULT_SITE_URL;

  return `${configured.startsWith("http") ? "" : "https://"}${configured}`.replace(
    /\/$/,
    "",
  );
};

export const getSiteUrl = () =>
  normalizeSiteUrl(
    process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.AUTH_URL ||
      process.env.NEXTAUTH_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL,
  );
