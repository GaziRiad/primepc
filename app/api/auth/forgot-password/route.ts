import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";

import {
  escapeAuthRegex,
  isValidAuthEmail,
  normalizeAuthEmail,
} from "@/lib/authValidation";
import startDbConnection from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/notifications";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { getSiteUrl } from "@/lib/site";
import PasswordResetToken from "@/models/PasswordResetToken";
import User from "@/models/User";

const GENERIC_RESPONSE = {
  ok: true,
  message:
    "Si un compte avec mot de passe existe pour cette adresse, un e-mail a été envoyé.",
};

const handleForgotPassword = async (request: Request) => {
  const ipLimit = await consumeRateLimit(request, {
    limit: 10,
    scope: "auth:forgot-password:ip",
    windowMs: 60 * 60 * 1000,
  });

  if (!ipLimit.allowed) {
    return rateLimitResponse(
      ipLimit,
      "Trop de demandes. Veuillez réessayer plus tard.",
    );
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 },
    );
  }

  const email = normalizeAuthEmail(body.email);
  if (!isValidAuthEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "invalid_email" },
      { status: 400 },
    );
  }

  const emailLimit = await consumeRateLimit(request, {
    identifier: email,
    limit: 3,
    scope: "auth:forgot-password:email",
    windowMs: 60 * 60 * 1000,
  });

  if (!emailLimit.allowed) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  await startDbConnection();
  const user = await User.findOne({
    email: new RegExp(`^${escapeAuthRegex(email)}$`, "i"),
    provider: "credentials",
  })
    .select("_id name email")
    .lean();

  if (!user) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await PasswordResetToken.init();
  await PasswordResetToken.findOneAndUpdate(
    { user: user._id },
    { expiresAt, tokenHash, user: user._id },
    { upsert: true },
  );

  await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    resetUrl: `${getSiteUrl()}/reset-password?token=${encodeURIComponent(token)}`,
  });

  return NextResponse.json(GENERIC_RESPONSE);
};

export async function POST(request: Request) {
  try {
    return await handleForgotPassword(request);
  } catch (error) {
    console.error("Password reset request failed:", error);
    return NextResponse.json(GENERIC_RESPONSE);
  }
}
