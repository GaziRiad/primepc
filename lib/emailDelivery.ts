import startDbConnection from "@/lib/db";
import EmailDelivery from "@/models/EmailDelivery";

type RecordAttemptInput = {
  category?: string;
  error?: unknown;
  providerId?: string;
  recipients: string[];
  relatedId?: string;
  status: string;
  subject: string;
};

const errorMessage = (value: unknown) => {
  if (value instanceof Error) return value.message.slice(0, 500);
  if (typeof value === "string") return value.slice(0, 500);
  return "";
};

export const recordEmailAttempt = async (input: RecordAttemptInput) => {
  try {
    await startDbConnection();
    const now = new Date();
    const document = {
      category: input.category || "transactional",
      events: [
        {
          type: input.status,
          createdAt: now,
          detail: errorMessage(input.error),
        },
      ],
      lastError: errorMessage(input.error),
      lastEventAt: now,
      providerId: input.providerId || undefined,
      recipients: input.recipients,
      relatedId: input.relatedId || "",
      status: input.status,
      subject: input.subject,
    };

    if (input.providerId) {
      await EmailDelivery.findOneAndUpdate(
        { providerId: input.providerId },
        {
          $push: {
            events: {
              $each: document.events,
              $slice: -25,
            },
          },
          $set: {
            lastError: document.lastError,
            lastEventAt: now,
            status: input.status,
          },
          $setOnInsert: {
            category: document.category,
            providerId: input.providerId,
            recipients: document.recipients,
            relatedId: document.relatedId,
            subject: document.subject,
          },
        },
        { upsert: true },
      );
      return;
    }

    await EmailDelivery.create(document);
  } catch (error) {
    console.error("Email delivery log failed:", error);
  }
};

const STATUS_EVENTS = new Set([
  "email.sent",
  "email.scheduled",
  "email.delivered",
  "email.delivery_delayed",
  "email.complained",
  "email.bounced",
  "email.failed",
  "email.suppressed",
]);

export const recordEmailWebhookEvent = async (event: {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    subject?: string;
    to?: string[];
    bounce?: { message?: string };
    failed?: { reason?: string };
    suppressed?: { message?: string };
  };
}) => {
  const providerId = String(event.data.email_id ?? "");
  if (!providerId) return;

  await startDbConnection();
  const createdAt = new Date(event.created_at);
  const detail =
    event.data.bounce?.message ||
    event.data.failed?.reason ||
    event.data.suppressed?.message ||
    "";
  const update: Record<string, unknown> = {
    $push: {
      events: {
        $each: [{ type: event.type, createdAt, detail }],
        $slice: -25,
      },
    },
    $set: {
      lastError: detail,
      lastEventAt: createdAt,
    },
    $setOnInsert: {
      category: "transactional",
      providerId,
      recipients: event.data.to ?? [],
      subject: event.data.subject ?? "",
    },
  };

  if (STATUS_EVENTS.has(event.type)) {
    (update.$set as Record<string, unknown>).status = event.type.replace(
      "email.",
      "",
    );
  } else {
    (update.$setOnInsert as Record<string, unknown>).status = event.type.replace(
      "email.",
      "",
    );
  }

  await EmailDelivery.findOneAndUpdate({ providerId }, update, {
    upsert: true,
  });
};

export const getEmailDeliveriesForAdmin = async (limit = 100) => {
  await startDbConnection();
  return EmailDelivery.find()
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(limit, 1), 200))
    .lean();
};
