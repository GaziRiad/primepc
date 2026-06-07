import { NextResponse } from "next/server";

import startDbConnection from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await startDbConnection();

    return NextResponse.json({
      ok: true,
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        ok: false,
        status: "unhealthy",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
