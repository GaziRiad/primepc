"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Banknote } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/hooks/useCart";
import { trackProductAnalytics } from "@/lib/analyticsClient";
import { formatDZD } from "@/lib/utils";
import { ALGERIA_LOCATIONS } from "@/lib/locations";

const SHIPPING_THRESHOLD = 40000;
const SHIPPING_FEE = 500;

type CheckoutFormState = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  apartment: string;
  city: string;
  commune: string;
  notes: string;
  country: string;
};

type CheckoutErrors = Partial<Record<keyof CheckoutFormState, string>>;
type TouchedState = Partial<Record<keyof CheckoutFormState, boolean>>;

const validateForm = (form: CheckoutFormState): CheckoutErrors => {
  const errors: CheckoutErrors = {};
  const firstName = form.firstName.trim();
  const lastName = form.lastName.trim();
  const phone = form.phone.trim();
  const email = form.email.trim();
  const street = form.street.trim();
  const phoneDigits = phone.replace(/\D/g, "");

  if (!firstName) {
    errors.firstName = "Le prénom est obligatoire.";
  } else if (firstName.length < 2) {
    errors.firstName = "Le prénom est trop court.";
  }

  if (!lastName) {
    errors.lastName = "Le nom est obligatoire.";
  } else if (lastName.length < 2) {
    errors.lastName = "Le nom est trop court.";
  }

  if (!phoneDigits) {
    errors.phone = "Le numéro de téléphone est obligatoire.";
  } else if (phoneDigits.length < 8) {
    errors.phone = "Saisissez un numéro de téléphone valide.";
  }

  if (!email) {
    errors.email = "L’adresse e-mail est obligatoire.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Saisissez une adresse e-mail valide.";
  }

  if (!street) {
    errors.street = "L’adresse est obligatoire.";
  } else if (street.length < 4) {
    errors.street = "L’adresse est trop courte.";
  }

  if (!form.city) {
    errors.city = "La ville est obligatoire.";
  }

  if (!form.commune) {
    errors.commune = "La commune est obligatoire.";
  }

  return errors;
};

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { cartItems, isLoading, clearCart } = useCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.finalPrice ?? 0) * item.quantity,
    0,
  );

  const shipping =
    subtotal >= SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  const hasItems = cartItems.length > 0;

  const [form, setForm] = useState<CheckoutFormState>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    street: "",
    apartment: "",
    city: "",
    commune: "",
    notes: "",
    country: "Algérie",
  });
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const addressPrefilledRef = useRef(false);
  const checkoutStartTrackedRef = useRef("");

  const errors = useMemo(() => validateForm(form), [form]);

  const showError = (field: keyof CheckoutFormState) =>
    (submitted || touched[field]) && errors[field];

  const markTouched = (field: keyof CheckoutFormState) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const updateField = (field: keyof CheckoutFormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const communes = useMemo(() => {
    const location = ALGERIA_LOCATIONS.find(
      (entry) => entry.city === form.city,
    );
    return location?.communes ?? [];
  }, [form.city]);

  useEffect(() => {
    if (!session?.user?.id || addressPrefilledRef.current) return;

    const controller = new AbortController();
    const sessionEmail =
      typeof session.user.email === "string" ? session.user.email : "";

    const prefill = async () => {
      try {
        const response = await fetch("/api/account/address", {
          signal: controller.signal,
        });

        const data = (await response.json()) as {
          ok?: boolean;
          address?: Partial<CheckoutFormState> | null;
        };
        const address = data?.address ?? null;

        addressPrefilledRef.current = true;

        if (response.ok && data?.ok && address) {
          setForm((prev) => {
            const hasExisting =
              prev.firstName ||
              prev.lastName ||
              prev.phone ||
              prev.street ||
              prev.city ||
              prev.commune;

            if (hasExisting) return prev;

            return {
              ...prev,
              ...address,
              email: prev.email || sessionEmail,
              country: address.country || prev.country,
            };
          });
        } else if (sessionEmail) {
          setForm((prev) =>
            prev.email ? prev : { ...prev, email: sessionEmail },
          );
        }
      } catch {
        addressPrefilledRef.current = true;
      }
    };

    void prefill();

    return () => {
      controller.abort();
    };
  }, [session?.user?.id, session?.user?.email]);

  useEffect(() => {
    if (isLoading || !hasItems) return;

    const analyticsItems = cartItems
      .map((item) => {
        const productId = String(item.product?._id ?? item.product?.id ?? "");
        const quantity = Number(item.quantity ?? 0);
        if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
          return null;
        }

        return {
          product: {
            coverImage: item.product.coverImage,
            finalPrice: item.product.finalPrice,
            name: item.product.name,
            slug: item.product.slug,
          },
          productId,
          quantity,
          type: "checkout_start" as const,
          value: item.product.finalPrice,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (analyticsItems.length === 0) return;

    const signature = analyticsItems
      .map((item) => `${item.productId}:${item.quantity}`)
      .sort()
      .join("|");

    if (checkoutStartTrackedRef.current === signature) return;

    const key = `primepc:analytics:checkout-start:${signature}`;
    try {
      if (window.sessionStorage.getItem(key) === "1") return;
      window.sessionStorage.setItem(key, "1");
    } catch {
      // Session storage can be unavailable in strict privacy modes.
    }

    checkoutStartTrackedRef.current = signature;
    trackProductAnalytics(analyticsItems);
  }, [cartItems, hasItems, isLoading]);

  const firstNameError = showError("firstName");
  const lastNameError = showError("lastName");
  const phoneError = showError("phone");
  const emailError = showError("email");
  const streetError = showError("street");
  const cityError = showError("city");
  const communeError = showError("commune");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    if (!hasItems) {
      toast.error("Votre panier est vide.");
      return;
    }

    setIsSubmitting(true);
    setOrderId(null);

    try {
      const { notes, ...customer } = form;
      const items = cartItems.map((item) => ({
        productId: String(item.product?._id ?? item.product?.id ?? ""),
        quantity: Number(item.quantity ?? 0),
        variantId: String(item.variantId ?? ""),
      }));

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, notes, items }),
      });

      const result = (await response.json()) as {
        ok?: boolean;
        orderId?: string;
        error?: string;
        message?: string;
      };

      if (!response.ok || !result?.ok || !result.orderId) {
        toast.error(
          result?.error === "rate_limited" && result.message
            ? result.message
            : "Impossible de passer la commande. Veuillez réessayer.",
        );
        return;
      }

      setOrderId(result.orderId);
      toast.success("Commande passée avec succès.");
      await clearCart();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de passer la commande";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-accent text-xl font-semibold sm:text-2xl">
            Commander
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Accueil / Commander
          </p>
        </div>
        <Button
          asChild
          variant="link"
          className="h-auto border-0 p-0 text-xs font-normal no-underline! sm:text-sm"
        >
          <Link href="/cart">Retour au panier</Link>
        </Button>
      </div>

      <section className="bg-accent-50 py-14">
        {orderId && (
          <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-xl border-[0.5px] bg-white px-6 py-4 text-sm shadow-xs">
              <p className="text-accent font-semibold">
                Commande passée avec succès.
              </p>
              <p className="text-muted-foreground mt-1">
                Numéro de votre commande :{" "}
                <span className="text-foreground">{orderId}</span>
              </p>
            </div>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8"
        >
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
              <h3 className="text-accent text-lg font-semibold">
                Vous avez un code promo ?
              </h3>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Saisissez un code promo"
                  className="h-11 rounded-full"
                />
                <Button
                  className="bg-primary-400 hover:bg-primary-500 h-11 rounded-full px-6 text-white"
                  type="button"
                >
                  Appliquer
                </Button>
              </div>
            </div>

            <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
              <h3 className="text-accent text-lg font-semibold">
                Informations de livraison
              </h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="first-name">
                    Prénom
                  </label>
                  <Input
                    id="first-name"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    onBlur={() => markTouched("firstName")}
                    aria-invalid={Boolean(firstNameError)}
                    aria-describedby={
                      firstNameError ? "first-name-error" : undefined
                    }
                  />
                  {firstNameError && (
                    <p
                      id="first-name-error"
                      className="text-destructive text-xs"
                    >
                      {firstNameError}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="last-name">
                    Nom
                  </label>
                  <Input
                    id="last-name"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    onBlur={() => markTouched("lastName")}
                    aria-invalid={Boolean(lastNameError)}
                    aria-describedby={
                      lastNameError ? "last-name-error" : undefined
                    }
                  />
                  {lastNameError && (
                    <p
                      id="last-name-error"
                      className="text-destructive text-xs"
                    >
                      {lastNameError}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="phone">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+213"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    onBlur={() => markTouched("phone")}
                    aria-invalid={Boolean(phoneError)}
                    aria-describedby={phoneError ? "phone-error" : undefined}
                  />
                  {phoneError && (
                    <p id="phone-error" className="text-destructive text-xs">
                      {phoneError}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Adresse e-mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    onBlur={() => markTouched("email")}
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? "email-error" : undefined}
                  />
                  {emailError && (
                    <p id="email-error" className="text-destructive text-xs">
                      {emailError}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="street">
                  Adresse
                </label>
                <Input
                  id="street"
                  placeholder="Nom et numéro de rue"
                  value={form.street}
                  onChange={(event) =>
                    updateField("street", event.target.value)
                  }
                  onBlur={() => markTouched("street")}
                  aria-invalid={Boolean(streetError)}
                  aria-describedby={streetError ? "street-error" : undefined}
                />
                {streetError && (
                  <p id="street-error" className="text-destructive text-xs">
                    {streetError}
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="apartment">
                  Appartement, bâtiment ou étage (facultatif)
                </label>
                <Input
                  id="apartment"
                  placeholder="Appartement, suite, unité"
                  value={form.apartment}
                  onChange={(event) =>
                    updateField("apartment", event.target.value)
                  }
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="city">
                    Ville
                  </label>
                  <Select
                    value={form.city}
                    onValueChange={(value) => {
                      setForm((prev) => ({
                        ...prev,
                        city: value,
                        commune: "",
                      }));
                      markTouched("city");
                    }}
                  >
                    <SelectTrigger
                      id="city"
                      className="w-full"
                      aria-invalid={Boolean(cityError)}
                    >
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
                  {cityError && (
                    <p className="text-destructive text-xs">{cityError}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="commune">
                    Commune
                  </label>
                  <Select
                    value={form.commune}
                    onValueChange={(value) => {
                      updateField("commune", value);
                      markTouched("commune");
                    }}
                    disabled={!form.city}
                  >
                    <SelectTrigger
                      id="commune"
                      className="w-full"
                      aria-invalid={Boolean(communeError)}
                    >
                      <SelectValue
                        placeholder={
                          form.city
                            ? "Sélectionnez une commune"
                            : "Sélectionnez d’abord une ville"
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
                  {communeError && (
                    <p className="text-destructive text-xs">{communeError}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                <label className="text-sm font-medium" htmlFor="country">
                  Pays
                </label>
                <Input id="country" value={form.country} disabled />
              </div>
            </div>

            <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
              <h3 className="text-accent text-lg font-semibold">
                Notes de commande (facultatif)
              </h3>
              <Textarea
                className="mt-4 min-h-28"
                placeholder="Notes concernant votre commande, instructions de livraison, etc."
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
              <h3 className="text-accent text-lg font-semibold">
                Récapitulatif de la commande
              </h3>

              {isLoading ? (
                <div className="text-muted-foreground mt-4 flex items-center gap-3 text-sm">
                  <Spinner className="size-4" />
                  Chargement de votre commande...
                </div>
              ) : (
                <div className="mt-4 border-y border-dashed py-4">
                  <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-wide uppercase">
                    <span>Produit</span>
                    <span>Total</span>
                  </div>
                  {hasItems ? (
                    <ul className="mt-3 flex flex-col gap-3 text-sm">
                      {cartItems.map((item, index) => {
                        const rawId = item.product?._id ?? item.product?.id;
                        const productId = rawId ? String(rawId) : "";
                        const price = item.product.finalPrice ?? 0;
                        const total = price * item.quantity;

                        return (
                          <li
                            key={`${productId || "item"}-${index}`}
                            className="flex items-start justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <p className="text-primary-700 line-clamp-1 font-medium">
                                {item.product.name ?? "Produit inconnu"}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                x{item.quantity}
                              </p>
                              {item.variantLabel && (
                                <p className="text-muted-foreground text-xs">
                                  {item.variantLabel}
                                </p>
                              )}
                            </div>
                            <span className="font-semibold">
                              {formatDZD(total)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground mt-3 text-sm">
                      Votre panier est vide.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Sous-total</span>
                  <span className="font-semibold">{formatDZD(subtotal)}</span>
                </div>
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>Livraison</span>
                  <span>
                    {shipping === 0 ? "Gratuit" : formatDZD(shipping)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4 text-base">
                  <span className="font-semibold">Total</span>
                  <span className="text-primary-800 font-semibold">
                    {formatDZD(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
              <h3 className="text-accent text-lg font-semibold">
                Mode de paiement
              </h3>
              <div className="border-primary-100 bg-primary-50/60 mt-4 rounded-xl border px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-500 text-primary-foreground flex size-9 items-center justify-center rounded-full">
                    <Banknote className="size-4" />
                  </div>
                  <div>
                    <p className="text-primary-800 text-sm font-semibold">
                      Paiement à la livraison
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Payez lorsque votre commande arrive chez vous.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                Le paiement à la livraison est la seule option disponible pour
                les adresses en Algérie.
              </p>

              <Button
                className="bg-primary-800 hover:bg-primary-700 mt-6 h-12 w-full rounded-full text-white"
                type="submit"
                disabled={!hasItems || isLoading || isSubmitting}
              >
                {isSubmitting
                  ? "Validation de la commande..."
                  : "Passer la commande"}
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
