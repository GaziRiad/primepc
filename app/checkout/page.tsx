"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Banknote } from "lucide-react";

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
import { formatDZD } from "@/lib/utils";

const ALGERIA_LOCATIONS = [
  {
    city: "Algiers",
    communes: ["Bab El Oued", "El Biar", "Hussein Dey", "Kouba"],
  },
  {
    city: "Oran",
    communes: ["El Hamri", "Es Senia", "Bir El Djir"],
  },
  {
    city: "Constantine",
    communes: ["El Khroub", "Didouche Mourad", "Hamma Bouziane"],
  },
  {
    city: "Annaba",
    communes: ["El Bouni", "Seraidi", "Oued El Aneb"],
  },
  {
    city: "Blida",
    communes: ["Boufarik", "Beni Mered", "Ouled Yaich"],
  },
  {
    city: "Setif",
    communes: ["Ain Arnat", "Ain Oulmene", "El Eulma"],
  },
  {
    city: "Tizi Ouzou",
    communes: ["Azazga", "Draa Ben Khedda", "Tigzirt"],
  },
  {
    city: "Batna",
    communes: ["Barika", "Ain Touta", "Tazoult"],
  },
];

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
    errors.firstName = "First name is required.";
  } else if (firstName.length < 2) {
    errors.firstName = "First name is too short.";
  }

  if (!lastName) {
    errors.lastName = "Last name is required.";
  } else if (lastName.length < 2) {
    errors.lastName = "Last name is too short.";
  }

  if (!phoneDigits) {
    errors.phone = "Phone number is required.";
  } else if (phoneDigits.length < 8) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!street) {
    errors.street = "Street address is required.";
  } else if (street.length < 4) {
    errors.street = "Street address is too short.";
  }

  if (!form.city) {
    errors.city = "City is required.";
  }

  if (!form.commune) {
    errors.commune = "Commune is required.";
  }

  return errors;
};

export default function CheckoutPage() {
  const { cartItems, isLoading } = useCart();

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
    country: "Algeria",
  });
  const [touched, setTouched] = useState<TouchedState>({});
  const [submitted, setSubmitted] = useState(false);

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

  const firstNameError = showError("firstName");
  const lastNameError = showError("lastName");
  const phoneError = showError("phone");
  const emailError = showError("email");
  const streetError = showError("street");
  const cityError = showError("city");
  const communeError = showError("commune");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
  };

  return (
    <div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-accent text-xl font-semibold sm:text-2xl">
            Checkout
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Home / Checkout
          </p>
        </div>
        <Button
          asChild
          variant="link"
          className="h-auto border-0 p-0 text-xs font-normal no-underline! sm:text-sm"
        >
          <Link href="/cart">Back to cart</Link>
        </Button>
      </div>

      <section className="bg-accent-50 py-14">
        <form
          onSubmit={handleSubmit}
          className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[2fr_1fr] lg:px-8"
        >
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
              <h3 className="text-accent text-lg font-semibold">
                Have a coupon code?
              </h3>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Input
                  placeholder="Enter coupon code"
                  className="h-11 rounded-full"
                />
                <Button
                  className="bg-primary-400 hover:bg-primary-500 h-11 rounded-full px-6 text-white"
                  type="button"
                >
                  Apply
                </Button>
              </div>
            </div>

            <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
              <h3 className="text-accent text-lg font-semibold">
                Shipping details
              </h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="first-name">
                    First name
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
                    Last name
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
                    Email address
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
                  Street address
                </label>
                <Input
                  id="street"
                  placeholder="Street name and number"
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
                  Apartment, suite, unit (optional)
                </label>
                <Input
                  id="apartment"
                  placeholder="Apartment, suite, unit"
                  value={form.apartment}
                  onChange={(event) =>
                    updateField("apartment", event.target.value)
                  }
                />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium" htmlFor="city">
                    City
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
                      <SelectValue placeholder="Select city" />
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
                          form.city ? "Select commune" : "Select city first"
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
                  Country
                </label>
                <Input id="country" value={form.country} disabled />
              </div>
            </div>

            <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
              <h3 className="text-accent text-lg font-semibold">
                Order notes (optional)
              </h3>
              <Textarea
                className="mt-4 min-h-28"
                placeholder="Notes about your order, delivery instructions, etc."
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
              <h3 className="text-accent text-lg font-semibold">
                Order Summary
              </h3>

              {isLoading ? (
                <div className="text-muted-foreground mt-4 flex items-center gap-3 text-sm">
                  <Spinner className="size-4" />
                  Loading your order...
                </div>
              ) : (
                <div className="mt-4 border-y border-dashed py-4">
                  <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-wide uppercase">
                    <span>Product</span>
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
                                {item.product.name ?? "Unknown product"}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                x{item.quantity}
                              </p>
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
                      Your cart is empty.
                    </p>
                  )}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatDZD(subtotal)}</span>
                </div>
                <div className="text-muted-foreground flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatDZD(shipping)}</span>
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
                Payment method
              </h3>
              <div className="border-primary-100 bg-primary-50/60 mt-4 rounded-xl border px-4 py-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary-500 text-primary-foreground flex size-9 items-center justify-center rounded-full">
                    <Banknote className="size-4" />
                  </div>
                  <div>
                    <p className="text-primary-800 text-sm font-semibold">
                      Cash on delivery
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Pay when your order arrives at your doorstep.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                Cash on delivery is the only available option for Algerian
                addresses.
              </p>

              <Button
                className="bg-primary-800 hover:bg-primary-700 mt-6 h-12 w-full rounded-full text-white"
                type="submit"
                disabled={!hasItems || isLoading}
              >
                Place Order
              </Button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
