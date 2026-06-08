import { auth } from "@/lib/auth";
import AddressForm from "@/components/(user)/AddressForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adresse",
};

export default async function page() {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <AddressForm />;
}
