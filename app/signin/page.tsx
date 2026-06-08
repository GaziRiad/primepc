import Logo from "@/components/Logo";
import { LoginForm } from "@/components/ui/login-form";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Se connecter",
};

const getSafeCallbackUrl = (value?: string | string[]) => {
  const callbackUrl = Array.isArray(value) ? value[0] : value;
  return callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
    ? callbackUrl
    : "/my-account";
};

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
  }>;
}) {
  const session = await auth();

  if (session?.user?.id) redirect("/my-account");

  const query = await searchParams;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-sm flex-col gap-3">
        <div className="flex scale-75 items-center justify-center">
          <Logo />
        </div>
        <LoginForm
          authError={error}
          callbackUrl={getSafeCallbackUrl(query.callbackUrl)}
        />
      </div>
    </div>
  );
}
