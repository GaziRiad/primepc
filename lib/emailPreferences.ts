import { createHmac, timingSafeEqual } from "node:crypto";

const ABANDONED_CART_PREFERENCE = "abandoned-cart";

const getSecret = () =>
  process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || "";

const signPreference = (userId: string) => {
  const secret = getSecret();
  if (!secret) return "";

  return createHmac("sha256", secret)
    .update(`${ABANDONED_CART_PREFERENCE}:${userId}`)
    .digest("hex");
};

export const buildAbandonedCartUnsubscribeUrl = (
  userId: string,
  siteUrl: string,
) => {
  const token = signPreference(userId);
  if (!token || !siteUrl) return "";

  const url = new URL("/api/email/unsubscribe", siteUrl);
  url.searchParams.set("user", userId);
  url.searchParams.set("token", token);
  return url.toString();
};

export const verifyAbandonedCartUnsubscribeToken = (
  userId: string,
  token: string,
) => {
  const expected = signPreference(userId);
  if (!expected || !token || expected.length !== token.length) return false;

  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
};
