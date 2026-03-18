import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();

  if (session?.user) redirect("/my-account");

  return (
    <div className="mx-auto max-w-6xl py-40">
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button type="submit">Signin with Google</button>
      </form>
    </div>
  );
}
