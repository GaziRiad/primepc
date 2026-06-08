import type { Metadata } from "next";

import { auth } from "@/lib/auth";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth();
  const name = session?.user?.name?.trim();

  return {
    title: name || "Mon compte",
  };
}

export default function page() {
  return (
    <div className="">
      <h3>TABLEAU DE BORD</h3>
    </div>
  );
}
