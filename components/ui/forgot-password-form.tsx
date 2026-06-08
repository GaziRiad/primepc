"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { AUTH_EMAIL_MAX_LENGTH } from "@/lib/authValidation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !data.ok) {
        toast.error(
          data.error === "invalid_email"
            ? "Veuillez saisir une adresse e-mail valide."
            : data.message || "Impossible d'envoyer la demande.",
        );
        return;
      }

      setSent(true);
    } catch {
      toast.error("Impossible d'envoyer la demande. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Mot de passe oublié</CardTitle>
        <CardDescription>
          Nous vous enverrons un lien sécurisé valable pendant une heure.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-sm">
              Si un compte avec mot de passe existe pour cette adresse, vous
              recevrez un e-mail dans quelques instants.
            </p>
            <Button asChild>
              <Link href="/signin">Retour à la connexion</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                <Input
                  id="reset-email"
                  type="email"
                  required
                  maxLength={AUTH_EMAIL_MAX_LENGTH}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  Envoyer le lien
                </Button>
                <FieldDescription className="text-center">
                  <Link href="/signin">Retour à la connexion</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
