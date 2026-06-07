import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import startDbConnection from "@/lib/db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/notifications";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function POST(request: Request) {
  try {
    const ipLimit = await consumeRateLimit(request, {
      limit: 8,
      scope: "auth:register:ip",
      windowMs: 60 * 60 * 1000,
    });

    if (!ipLimit.allowed) {
      return rateLimitResponse(
        ipLimit,
        "Trop de tentatives de creation de compte. Veuillez reessayer plus tard.",
      );
    }

    let body: { name?: string; email?: string; password?: string };
    try {
      body = (await request.json()) as {
        name?: string;
        email?: string;
        password?: string;
      };
    } catch {
      return NextResponse.json(
        { ok: false, error: "invalid_payload" },
        { status: 400 },
      );
    }

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "missing_fields" },
        { status: 400 },
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "weak_password" },
        { status: 400 },
      );
    }

    const emailLimit = await consumeRateLimit(request, {
      identifier: email,
      limit: 3,
      scope: "auth:register:email",
      windowMs: 60 * 60 * 1000,
    });

    if (!emailLimit.allowed) {
      return rateLimitResponse(
        emailLimit,
        "Trop de tentatives pour cette adresse email. Veuillez reessayer plus tard.",
      );
    }

    await startDbConnection();

    const existingUser = await User.findOne({
      email: new RegExp(`^${escapeRegex(email)}$`, "i"),
    });

    if (existingUser) {
      if (existingUser.passwordHash) {
        return NextResponse.json(
          { ok: false, error: "account_exists" },
          { status: 409 },
        );
      }

      existingUser.passwordHash = await hash(password, 10);
      if (!existingUser.name && name) existingUser.name = name;
      await existingUser.save();

      return NextResponse.json({ ok: true, linked: true });
    }

    const passwordHash = await hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      passwordHash,
      provider: "credentials",
    });

    void sendWelcomeEmail({
      email: newUser.email,
      name: newUser.name,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Account registration failed:", error);
    return NextResponse.json(
      { ok: false, error: "registration_failed" },
      { status: 500 },
    );
  }
}
