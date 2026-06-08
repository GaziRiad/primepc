import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export const requireAdmin = async () => {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    redirect("/");
  }

  return session;
};
