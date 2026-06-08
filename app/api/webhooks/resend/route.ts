import { NextResponse } from "next/server";
import { Resend } from "resend";

import { recordEmailWebhookEvent } from "@/lib/emailDelivery";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(request: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { ok: false, error: "webhook_not_configured" },
      { status: 503 },
    );
  }

  try {
    const payload = await request.text();
    const event = resend.webhooks.verify({
      payload,
      webhookSecret,
      headers: {
        id: request.headers.get("svix-id") || "",
        signature: request.headers.get("svix-signature") || "",
        timestamp: request.headers.get("svix-timestamp") || "",
      },
    });

    if (event.type.startsWith("email.") && "email_id" in event.data) {
      await recordEmailWebhookEvent(
        event as Parameters<typeof recordEmailWebhookEvent>[0],
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Invalid Resend webhook:", error);
    return NextResponse.json(
      { ok: false, error: "invalid_webhook" },
      { status: 400 },
    );
  }
}
