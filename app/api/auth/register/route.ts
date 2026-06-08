import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import startDbConnection from "@/lib/db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/notifications";
import { consumeRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import {
  escapeAuthRegex,
  isValidAuthEmail,
  isValidAuthName,
  isValidAuthPassword,
  normalizeAuthEmail,
  normalizeAuthName,
} from "@/lib/authValidation";

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

    const name = normalizeAuthName(body?.name);
    const email = normalizeAuthEmail(body?.email);
    const password = String(body?.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "missing_fields" },
        { status: 400 },
      );
    }

    if (!isValidAuthName(name)) {
      return NextResponse.json(
        { ok: false, error: "invalid_name" },
        { status: 400 },
      );
    }

    if (!isValidAuthEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "invalid_email" },
        { status: 400 },
      );
    }

    if (!isValidAuthPassword(password)) {
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
      email: new RegExp(`^${escapeAuthRegex(email)}$`, "i"),
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: "account_exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hash(password, 10);
    let newUser;

    try {
      newUser = await User.create({
        name,
        email,
        passwordHash,
        provider: "credentials",
        providers: ["credentials"],
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        return NextResponse.json(
          { ok: false, error: "account_exists" },
          { status: 409 },
        );
      }

      throw error;
    }

    await sendWelcomeEmail({
      email: newUser.email,
      name: newUser.name,
    }).catch((error) => {
      console.error("Registration welcome email failed:", error);
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
