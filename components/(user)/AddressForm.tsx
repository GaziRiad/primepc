"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ALGERIA_LOCATIONS } from "@/lib/locations";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  if (!address.city) return false;
  if (!address.commune) return false;

  return true;
};

export default function AddressForm() {
  const [address, setAddress] = useState<AddressState>(emptyAddress);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const communes = useMemo(() => {
    const location = ALGERIA_LOCATIONS.find(
      (entry) => entry.city === address.city,
    );
    return location?.communes ?? [];
  }, [address.city]);

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
            <FieldLabel>Ville</FieldLabel>
            <Select
              value={address.city}
              onValueChange={(value) =>
                setAddress((prev) => ({
                  ...prev,
                  city: value,
                  commune: "",
                }))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une ville" />
              </SelectTrigger>
              <SelectContent>
                {ALGERIA_LOCATIONS.map((location) => (
                  <SelectItem key={location.city} value={location.city}>
                    {location.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Commune</FieldLabel>
            <Select
              value={address.commune}
              onValueChange={(value) =>
                setAddress((prev) => ({
                  ...prev,
                  commune: value,
                }))
              }
              disabled={isLoading || communes.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    communes.length === 0
                      ? "Sélectionnez d’abord une ville"
                      : "Sélectionnez une commune"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {communes.map((commune) => (
                  <SelectItem key={commune} value={commune}>
                    {commune}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
