import nodemailer from "nodemailer";

type OrderNotificationPayload = {
  orderId: string;
  total: number;
  itemsCount: number;
  customerName: string;
  phone: string;
  city: string;
  commune: string;
  createdAt: Date;
};

const formatText = (payload: OrderNotificationPayload) => {
  const lines = [
    `New order: ${payload.orderId}`,
    `Customer: ${payload.customerName}`,
    `Phone: ${payload.phone}`,
    `Location: ${payload.city}${payload.commune ? ", " + payload.commune : ""}`,
    `Items: ${payload.itemsCount}`,
    `Total: ${payload.total} DZD`,
    `Placed: ${payload.createdAt.toISOString()}`,
  ];

  return lines.join("\n");
};

const sendTelegram = async (text: string) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
};

const sendEmail = async (text: string) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user;
  const to = process.env.SMTP_TO;

  if (!host || !user || !pass || !from || !to) return;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to,
    subject: "New PRIMEPC order",
    text,
  });
};

export const sendAdminOrderNotification = async (
  payload: OrderNotificationPayload,
) => {
  const text = formatText(payload);

  await Promise.allSettled([sendTelegram(text), sendEmail(text)]);
};
