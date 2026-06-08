import type { Metadata } from "next";

import { requireAdmin } from "@/lib/adminAuth";
import { getEmailDeliveriesForAdmin } from "@/lib/emailDelivery";

export const metadata: Metadata = {
  title: "E-mails - Administration",
};

const statusClass = (status: string) => {
  if (status === "delivered") return "bg-emerald-100 text-emerald-700";
  if (["failed", "bounced", "complained", "suppressed"].includes(status)) {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-slate-100 text-slate-700";
};

export default async function EmailPage() {
  await requireAdmin();
  const deliveries = await getEmailDeliveriesForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold">
          Livraison des e-mails
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Les 100 envois les plus recents et leur dernier evenement Resend.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-xs">
        <table className="w-full min-w-220 text-sm">
          <thead className="bg-muted/30 text-muted-foreground text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Destinataire</th>
              <th className="px-5 py-3 font-medium">Sujet</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <th className="px-5 py-3 font-medium">Erreur</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-muted-foreground px-5 py-6">
                  Aucun envoi journalise pour le moment.
                </td>
              </tr>
            ) : (
              deliveries.map((delivery) => (
                <tr key={String(delivery._id)} className="border-t">
                  <td className="text-muted-foreground px-5 py-4 text-xs">
                    {new Date(delivery.createdAt).toLocaleString("fr-FR")}
                  </td>
                  <td className="px-5 py-4">{delivery.category}</td>
                  <td className="px-5 py-4">
                    {(delivery.recipients ?? []).join(", ")}
                  </td>
                  <td className="max-w-80 truncate px-5 py-4">
                    {delivery.subject}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(delivery.status)}`}
                    >
                      {delivery.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground max-w-80 truncate px-5 py-4 text-xs">
                    {delivery.lastError || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
