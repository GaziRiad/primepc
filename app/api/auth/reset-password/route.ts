import { createHash } from "crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { isValidAuthPassword } from "@/lib/authValidation";
import startDbConnection from "@/lib/db";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import PasswordResetToken from "@/models/PasswordResetToken";
import User from "@/models/User";

const TOKEN_REGEX = /^[a-f0-9]{64}$/i;

const handlePasswordReset = async (request: Request) => {
  const ipLimit = await consumeRateLimit(request, {
    limit: 10,
    scope: "auth:reset-password:ip",
    windowMs: 60 * 60 * 1000,
  });

  if (!ipLimit.allowed) {
    return rateLimitResponse(
      ipLimit,
      "Trop de tentatives. Veuillez réessayer plus tard.",
    );
  }

  let body: { password?: string; token?: string };
  try {
    body = (await request.json()) as { password?: string; token?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 },
    );
  }

  const token = String(body.token ?? "").trim();
  const password = String(body.password ?? "");

  if (!TOKEN_REGEX.test(token)) {
    return NextResponse.json(
      { ok: false, error: "invalid_token" },
      { status: 400 },
    );
  }

  if (!isValidAuthPassword(password)) {
    return NextResponse.json(
      { ok: false, error: "weak_password" },
      { status: 400 },
    );
  }

  await startDbConnection();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const resetToken = await PasswordResetToken.findOneAndDelete({
    expiresAt: { $gt: new Date() },
    tokenHash,
  }).lean();

  if (!resetToken) {
    return NextResponse.json(
      { ok: false, error: "invalid_token" },
      { status: 400 },
    );
  }

  const passwordHash = await hash(password, 10);
  const result = await User.updateOne(
    { _id: resetToken.user },
    {
      $addToSet: { providers: "credentials" },
      $inc: { sessionVersion: 1 },
      $set: { passwordHash },
    },
  );

  if (result.modifiedCount !== 1) {
    return NextResponse.json(
      { ok: false, error: "invalid_token" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
};

export async function POST(request: Request) {
  try {
    return await handlePasswordReset(request);
  } catch (error) {
    console.error("Password reset failed:", error);
    return NextResponse.json(
      { ok: false, error: "reset_failed" },
      { status: 500 },
    );
  }
}
