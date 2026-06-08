import Link from "next/link";
import type { Metadata } from "next";

import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Erreur de connexion",
};

const getErrorMessage = (error?: string) => {
  if (error === "AccessDenied") {
    return "Ce compte utilise déjà une autre méthode de connexion. Utilisez la méthode choisie lors de sa création.";
  }

  return "La connexion n'a pas pu être terminée. Veuillez réessayer dans quelques instants.";
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const query = await searchParams;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mx-auto flex max-w-sm flex-col gap-3">
        <div className="flex scale-75 items-center justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Connexion impossible</CardTitle>
            <CardDescription>{getErrorMessage(error)}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/signin">Retour à la connexion</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
