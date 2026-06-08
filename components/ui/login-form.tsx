"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
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
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AUTH_EMAIL_MAX_LENGTH,
  AUTH_PASSWORD_MAX_LENGTH,
} from "@/lib/authValidation";

export function LoginForm({
  authError,
  callbackUrl = "/my-account",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  authError?: string;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error("Veuillez saisir votre e-mail et votre mot de passe.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (result?.code === "rate_limited") {
        toast.error(
          "Trop de tentatives de connexion. Veuillez réessayer plus tard.",
        );
        return;
      }

      if (result?.error) {
        toast.error("E-mail ou mot de passe incorrect.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Impossible de vous connecter. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Heureux de vous revoir</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte pour continuer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <p
              role="alert"
              className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {authError === "OAuthAccountNotLinked"
                ? "Ce compte utilise une autre méthode de connexion."
                : "Impossible de vous connecter. Veuillez réessayer."}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button
                  className="cursor-pointer"
                  variant="outline"
                  type="button"
                  onClick={() =>
                    signIn(
                      "google",
                      { redirectTo: callbackUrl },
                      {
                        prompt: "select_account",
                      },
                    )
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Se connecter avec Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Ou continuer avec
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  maxLength={AUTH_EMAIL_MAX_LENGTH}
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  maxLength={AUTH_PASSWORD_MAX_LENGTH}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </Field>
              <Field>
                <Button
                  className="cursor-pointer"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Se connecter
                </Button>
                <FieldDescription className="text-center">
                  Vous n&apos;avez pas de compte ?{" "}
                  <Link href="/register" className="underline">
                    S&apos;inscrire
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        En continuant, vous acceptez nos{" "}
        <a href="#">Conditions d’utilisation</a> et{" "}
        <a href="#">Politique de confidentialité</a>.
      </FieldDescription>
    </div>
  );
}
