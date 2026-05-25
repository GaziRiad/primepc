import { NextResponse } from "next/server";

import startDbConnection from "@/lib/db";
import { auth } from "@/lib/auth";
import User from "@/models/User";

type AddressPayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  street?: string;
  apartment?: string;
  city?: string;
  commune?: string;
  country?: string;
};

const normalizeAddress = (payload: AddressPayload) => ({
  firstName: String(payload.firstName ?? "").trim(),
  lastName: String(payload.lastName ?? "").trim(),
  phone: String(payload.phone ?? "").trim(),
  street: String(payload.street ?? "").trim(),
  apartment: String(payload.apartment ?? "").trim(),
  city: String(payload.city ?? "").trim(),
  commune: String(payload.commune ?? "").trim(),
  country: String(payload.country ?? "Algeria").trim() || "Algeria",
});

const validateAddress = (address: ReturnType<typeof normalizeAddress>) => {
  const phoneDigits = address.phone.replace(/\D/g, "");

  if (!address.firstName || address.firstName.length < 2) return false;
  if (!address.lastName || address.lastName.length < 2) return false;
  if (!phoneDigits || phoneDigits.length < 8) return false;
  if (!address.street || address.street.length < 4) return false;
  if (!address.city) return false;
  if (!address.commune) return false;

  return true;
};

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
    .select("shippingAddress")
    .lean();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    address: user.shippingAddress ?? null,
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

  let body: AddressPayload;
  try {
    body = (await request.json()) as AddressPayload;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_payload" },
      { status: 400 },
    );
  }

  const address = normalizeAddress(body);

  if (!validateAddress(address)) {
    return NextResponse.json(
      { ok: false, error: "invalid_address" },
      { status: 400 },
    );
  }

  await startDbConnection();

  const user = await User.findByIdAndUpdate(
    session.user.id,
    { shippingAddress: address },
    { new: true, runValidators: true },
  )
    .select("shippingAddress")
    .lean();

  if (!user) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, address: user.shippingAddress ?? null });
}
