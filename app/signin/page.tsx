import Logo from "@/components/Logo";
import { LoginForm } from "@/components/ui/login-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();

  if (session?.user) redirect("/my-account");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-sm flex-col gap-3">
        <div className="flex scale-75 items-center justify-center">
          <Logo />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
