import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

import startDbConnection from "@/lib/db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/notifications";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

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
    const message =
      error instanceof Error ? error.message : "Unable to create account";

    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
