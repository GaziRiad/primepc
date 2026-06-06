import { verifyAbandonedCartUnsubscribeToken } from "@/lib/emailPreferences";
import startDbConnection from "@/lib/db";
import { cancelAbandonedCartReminder } from "@/lib/cartRecovery";
import User from "@/models/User";

const renderMessage = (title: string, message: string, status = 200) =>
  new Response(
    `<!doctype html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${title}</title>
        </head>
        <body style="margin:0;background:#f6f7f9;font-family:Arial,sans-serif;color:#1f2937;">
          <main style="max-width:560px;margin:64px auto;padding:0 16px;">
            <div style="overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#fff;">
              <div style="padding:20px 24px;background:#07111f;color:#fff;font-size:20px;font-weight:700;">PRIMEPC</div>
              <div style="padding:28px 24px;">
                <h1 style="margin:0 0 12px;font-size:24px;">${title}</h1>
                <p style="margin:0;line-height:1.6;color:#6b7280;">${message}</p>
              </div>
            </div>
          </main>
        </body>
      </html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

const unsubscribe = async (request: Request) => {
  const url = new URL(request.url);
  const userId = url.searchParams.get("user")?.trim() || "";
  const token = url.searchParams.get("token")?.trim() || "";

  if (!verifyAbandonedCartUnsubscribeToken(userId, token)) {
    return renderMessage(
      "Lien invalide",
      "Ce lien de désinscription est invalide ou incomplet.",
      400,
    );
  }

  await startDbConnection();
  await User.findByIdAndUpdate(userId, {
    $set: { abandonedCartEmailsEnabled: false },
  });
  await cancelAbandonedCartReminder(userId, false).catch(() => null);

  return renderMessage(
    "Préférence enregistrée",
    "Vous ne recevrez plus de rappels concernant les produits laissés dans votre panier.",
  );
};

export const GET = unsubscribe;
export const POST = unsubscribe;
