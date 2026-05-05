import { auth } from "@/lib/auth";

export default async function page() {
  const session = await auth();

  return (
    <div className="">
      <h3>ACCOUNT DETAILS</h3>

      <p>Email: {session?.user.email}</p>
    </div>
  );
}
