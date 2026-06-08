import Logo from "@/components/Logo";
import { ResetPasswordForm } from "@/components/ui/reset-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const query = await searchParams;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-sm flex-col gap-3">
        <div className="flex scale-75 items-center justify-center">
          <Logo />
        </div>
        <ResetPasswordForm token={token ?? ""} />
      </div>
    </div>
  );
}
