import { auth } from "@/lib/auth";
import AddressForm from "@/components/(user)/AddressForm";

export default async function page() {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <AddressForm />;
}
