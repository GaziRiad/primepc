import { NextResponse } from "next/server";

import startDbConnection from "@/lib/db";
import { auth } from "@/lib/auth";
import User from "@/models/User";

const NAME_MIN = 2;
const NAME_MAX = 80;

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthenticated" },
      { status: 401 },
    );
  }

  await startDbConnection();

  const user = await User.findById(session.user.id)
    .select("name email image")
    .lean();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    profile: {
      name: user.name ?? "",
      email: user.email ?? "",
      image: user.image ?? "",
    },
  });
}

export async function PUT(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { ok: false, error: "unauthenticated" },
      { status: 401 },
    );
  }

  let body: { name?: string; image?: string };
  try {
    body = (await request.json()) as { name?: string; image?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 },
    );
  }

  const name = String(body?.name ?? "").trim();
  const image = String(body?.image ?? "").trim();

  if (!name || name.length < NAME_MIN || name.length > NAME_MAX) {
    return NextResponse.json(
      { ok: false, error: "invalid_name" },
      { status: 400 },
    );
  }

  if (image && !/^https?:\/\//i.test(image)) {
    return NextResponse.json(
      { ok: false, error: "invalid_image" },
      { status: 400 },
    );
  }

  await startDbConnection();

  const user = await User.findByIdAndUpdate(
    session.user.id,
    { name, image },
    { returnDocument: "after", runValidators: true },
  )
    .select("name email image")
    .lean();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    profile: {
      name: user.name ?? "",
      email: user.email ?? "",
      image: user.image ?? "",
    },
  });
}
