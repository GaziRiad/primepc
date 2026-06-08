import { auth } from "@/lib/auth";
import AccountDetailsForm from "@/components/(user)/AccountDetailsForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Détails du compte",
};

export default async function page() {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <AccountDetailsForm />;
}
