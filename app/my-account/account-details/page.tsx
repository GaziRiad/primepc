import { auth } from "@/lib/auth";
import AccountDetailsForm from "@/components/(user)/AccountDetailsForm";

export default async function page() {
  const session = await auth();

  if (!session?.user?.id) return null;

  return <AccountDetailsForm />;
}
