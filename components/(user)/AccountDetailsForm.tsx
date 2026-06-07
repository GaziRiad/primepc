"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import ImageUploadButton from "@/components/admin/ImageUploadButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const NAME_MIN = 2;
const NAME_MAX = 80;

type ProfileState = {
  name: string;
  email: string;
  image: string;
};

export default function AccountDetailsForm() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<ProfileState>({
    name: "",
    email: "",
    image: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const initials = useMemo(() => {
    return profile.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [profile.name]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const controller = new AbortController();

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/account/profile", {
          signal: controller.signal,
        });
        const data = (await response.json()) as {
          ok?: boolean;
          profile?: ProfileState;
        };

        if (response.ok && data?.ok && data.profile) {
          setProfile({
            name: data.profile.name ?? "",
            email: data.profile.email ?? "",
            image: data.profile.image ?? "",
          });
          return;
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }

      setProfile({
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        image: session.user.image ?? "",
      });
    };

    void loadProfile();

    return () => {
      controller.abort();
    };
  }, [
    session?.user?.id,
    session?.user?.email,
    session?.user?.name,
    session?.user?.image,
  ]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = profile.name.trim();
    const image = profile.image.trim();

    if (name.length < NAME_MIN || name.length > NAME_MAX) {
      toast.error("Veuillez saisir un nom complet valide.");
      return;
    }

    if (image && !/^https?:\/\//i.test(image)) {
      toast.error("La photo de profil doit être une URL valide.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image }),
      });

      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        profile?: ProfileState;
      };

      if (!response.ok || !data?.ok || !data.profile) {
        toast.error("Impossible de mettre à jour le profil.");
        return;
      }

      setProfile({
        name: data.profile.name ?? "",
        email: data.profile.email ?? profile.email,
        image: data.profile.image ?? "",
      });

      toast.success("Profil mis à jour avec succès.");
      await update();
      router.refresh();
    } catch {
      toast.error("Impossible de mettre à jour le profil. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground text-lg font-semibold">
          Détails du compte
        </h3>
        <p className="text-muted-foreground text-sm">
          Mettez à jour vos informations et votre photo de profil.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4 shadow-xs">
          <Avatar size="lg" className="h-16 w-16">
            <AvatarImage src={profile.image || undefined} />
            <AvatarFallback>{initials || "??"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-sm font-medium">Photo de profil</p>
            <p className="text-muted-foreground text-xs">
              Importez une image carrée pour un meilleur rendu.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ImageUploadButton
              label="Importer une photo"
              folder="primepc/users"
              onUpload={(url) =>
                setProfile((prev) => ({ ...prev, image: url }))
              }
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setProfile((prev) => ({ ...prev, image: "" }))}
            >
              Retirer
            </Button>
          </div>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="full-name">Nom complet</FieldLabel>
            <Input
              id="full-name"
              type="text"
              placeholder="Votre nom complet"
              value={profile.name}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              disabled={isLoading}
            />
            <FieldDescription>
              Ce nom sera utilisé pour votre compte et vos commandes.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" value={profile.email} disabled />
            <FieldDescription>
              Votre e-mail est utilisé pour la connexion et le suivi de vos
              commandes.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="profile-image">
              URL de la photo de profil
            </FieldLabel>
            <Input
              id="profile-image"
              type="url"
              placeholder="https://"
              value={profile.image}
              onChange={(event) =>
                setProfile((prev) => ({
                  ...prev,
                  image: event.target.value,
                }))
              }
              disabled={isLoading}
            />
            <FieldDescription>
              Vous pouvez coller une URL d’image directe ou utiliser le bouton
              d’importation ci-dessus.
            </FieldDescription>
          </Field>
        </FieldGroup>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSaving || isLoading}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Spinner className="size-4" />
                Saving
              </span>
            ) : (
              "Enregistrer les modifications"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
