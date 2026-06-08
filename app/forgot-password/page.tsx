import Logo from "@/components/Logo";
import { ForgotPasswordForm } from "@/components/ui/forgot-password-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
};

export default function Page() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-sm flex-col gap-3">
        <div className="flex scale-75 items-center justify-center">
          <Logo />
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
