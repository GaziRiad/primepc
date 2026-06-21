"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ALGERIA_WILAYAS, normalizeWilayaName } from "@/lib/locations";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

const DEFAULT_COUNTRY = "Algérie";

const emptyAddress = {
  firstName: "",
  lastName: "",
  phone: "",
  street: "",
  apartment: "",
  city: "",
  commune: "",
  country: DEFAULT_COUNTRY,
};

type AddressState = typeof emptyAddress;

const isValidAddress = (address: AddressState) => {
  const phoneDigits = address.phone.replace(/\D/g, "");

  if (!address.firstName || address.firstName.length < 2) return false;
  if (!address.lastName || address.lastName.length < 2) return false;
  if (!phoneDigits || phoneDigits.length < 8) return false;
  if (!address.street || address.street.length < 4) return false;
  if (!normalizeWilayaName(address.city)) return false;
  if (!address.commune.trim()) return false;

  return true;
};

export default function AddressForm() {
  const [address, setAddress] = useState<AddressState>(emptyAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadAddress = async () => {
      try {
        const response = await fetch("/api/account/address", {
          signal: controller.signal,
        });
        const data = (await response.json()) as {
          ok?: boolean;
          address?: Partial<AddressState> | null;
        };

        if (response.ok && data?.ok && data.address) {
          setAddress({
            ...emptyAddress,
            ...data.address,
            city: normalizeWilayaName(data.address.city) || "",
            country: data.address.country || DEFAULT_COUNTRY,
          });
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };

    void loadAddress();

    return () => controller.abort();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidAddress(address)) {
      toast.error("Veuillez remplir tous les champs d’adresse obligatoires.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/account/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });

      const data = (await response.json()) as { ok?: boolean };

      if (!response.ok || !data?.ok) {
        toast.error("Impossible d’enregistrer l’adresse.");
        return;
      }

      toast.success("Adresse enregistrée avec succès.");
    } catch {
      toast.error("Impossible d’enregistrer l’adresse. Veuillez réessayer.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-foreground text-lg font-semibold">
          Adresse enregistrée
        </h3>
        <p className="text-muted-foreground text-sm">
          Enregistrez une adresse de livraison par défaut pour préremplir la
          commande.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="first-name">Prénom</FieldLabel>
            <Input
              id="first-name"
              value={address.firstName}
              onChange={(event) =>
                setAddress((prev) => ({
                  ...prev,
                  firstName: event.target.value,
                }))
              }
              disabled={isLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="last-name">Nom</FieldLabel>
            <Input
              id="last-name"
              value={address.lastName}
              onChange={(event) =>
                setAddress((prev) => ({
                  ...prev,
                  lastName: event.target.value,
                }))
              }
              disabled={isLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Numéro de téléphone</FieldLabel>
            <Input
              id="phone"
              value={address.phone}
              onChange={(event) =>
                setAddress((prev) => ({
                  ...prev,
                  phone: event.target.value,
                }))
              }
              disabled={isLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="street">Adresse</FieldLabel>
            <Input
              id="street"
              value={address.street}
              onChange={(event) =>
                setAddress((prev) => ({
                  ...prev,
                  street: event.target.value,
                }))
              }
              disabled={isLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="apartment">
              Appartement, suite, etc.
            </FieldLabel>
            <Input
              id="apartment"
              value={address.apartment}
              onChange={(event) =>
                setAddress((prev) => ({
                  ...prev,
                  apartment: event.target.value,
                }))
              }
              disabled={isLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="city">Wilaya</FieldLabel>
            <select
              id="city"
              value={address.city}
              onChange={(event) =>
                setAddress((prev) => ({
                  ...prev,
                  city: event.target.value,
                  commune: "",
                }))
              }
              disabled={isLoading}
              className="border-input bg-background h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Selectionnez une wilaya</option>
              {ALGERIA_WILAYAS.map((wilaya) => (
                <option key={wilaya.code} value={wilaya.name}>
                  {wilaya.code} - {wilaya.name}
                </option>
              ))}
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor="commune">Commune</FieldLabel>
            <Input
              id="commune"
              value={address.commune}
              placeholder="Tapez votre commune"
              onChange={(event) =>
                setAddress((prev) => ({
                  ...prev,
                  commune: event.target.value,
                }))
              }
              disabled={isLoading}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="country">Pays</FieldLabel>
            <Input
              id="country"
              value={address.country}
              onChange={(event) =>
                setAddress((prev) => ({
                  ...prev,
                  country: event.target.value,
                }))
              }
              disabled={isLoading}
            />
            <FieldDescription>
              Cette adresse sera utilisée par défaut pour vos prochaines
              commandes.
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
              "Enregistrer l’adresse"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
