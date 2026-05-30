"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

type ContactField =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "subject"
  | "message";

type ContactFormState = Record<ContactField, string> & {
  company: string;
};

type ContactErrors = Partial<Record<ContactField, string>>;

const INITIAL_STATE: ContactFormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  company: "",
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (values: ContactFormState) => {
  const errors: ContactErrors = {};
  const phoneDigits = values.phone.replace(/\D/g, "");

  if (!values.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!values.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (phoneDigits.length < 7) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!values.subject.trim()) {
    errors.subject = "Subject is required.";
  } else if (values.subject.trim().length < 3) {
    errors.subject = "Subject must be at least 3 characters.";
  }

  if (!values.message.trim()) {
    errors.message = "Message is required.";
  } else if (values.message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
};

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: ContactField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        if (payload?.errors) {
          setErrors(payload.errors as ContactErrors);
        }
        toast.error(payload?.message || "Something went wrong.");
        return;
      }

      toast.success("Message sent. We will get back to you soon.");
      setForm(INITIAL_STATE);
      setErrors({});
    } catch {
      toast.error("Unable to send your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-accent-50 min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-accent-500 text-xs tracking-[0.2em] uppercase">
              Contact
            </p>
            <h1 className="text-foreground mt-2 text-2xl font-semibold">
              Get in touch
            </h1>
          </div>
          <div className="text-muted-foreground text-sm">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Contact</span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div className="rounded-2xl border bg-white p-6 shadow-xs">
            <h2 className="text-foreground text-lg font-semibold">
              Contact Information
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Reach out anytime. We respond within 24 hours on business days.
            </p>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                  <Mail className="size-4" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">
                    Email
                  </p>
                  <a
                    href="mailto:support@primepc.dz"
                    className="text-foreground font-medium"
                  >
                    support@primepc.dz
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                  <Phone className="size-4" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">
                    Phone
                  </p>
                  <a
                    href="tel:+213555000000"
                    className="text-foreground font-medium"
                  >
                    +213 555 00 00 00
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full">
                  <MapPin className="size-4" />
                </span>
                <div>
                  <p className="text-muted-foreground text-xs uppercase">
                    Address
                  </p>
                  <p className="text-foreground font-medium">
                    Algiers, Algeria
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border bg-slate-50 px-4 py-3 text-sm">
              <p className="text-foreground font-medium">Support hours</p>
              <p className="text-muted-foreground mt-1">
                Sunday - Thursday, 9:00 AM to 6:00 PM.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-xs">
            <h2 className="text-foreground text-lg font-semibold">
              Send us a message
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Tell us what you need and we will respond quickly.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 flex flex-col gap-5"
              noValidate
            >
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, company: event.target.value }))
                }
                tabIndex={-1}
                autoComplete="off"
                className="sr-only"
                aria-hidden="true"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="first-name">
                    First name <span className="text-primary">*</span>
                  </FieldLabel>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    aria-invalid={Boolean(errors.firstName)}
                    aria-describedby={
                      errors.firstName ? "first-name-error" : undefined
                    }
                    disabled={isSubmitting}
                    autoComplete="given-name"
                    required
                  />
                  <FieldError id="first-name-error">
                    {errors.firstName}
                  </FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="last-name">
                    Last name <span className="text-primary">*</span>
                  </FieldLabel>
                  <Input
                    id="last-name"
                    type="text"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    aria-invalid={Boolean(errors.lastName)}
                    aria-describedby={
                      errors.lastName ? "last-name-error" : undefined
                    }
                    disabled={isSubmitting}
                    autoComplete="family-name"
                    required
                  />
                  <FieldError id="last-name-error">
                    {errors.lastName}
                  </FieldError>
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="email">
                    Email <span className="text-primary">*</span>
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    disabled={isSubmitting}
                    autoComplete="email"
                    required
                  />
                  <FieldError id="email-error">{errors.email}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">
                    Phone <span className="text-primary">*</span>
                  </FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+213"
                    value={form.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    disabled={isSubmitting}
                    autoComplete="tel"
                    required
                  />
                  <FieldError id="phone-error">{errors.phone}</FieldError>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="subject">
                  Subject <span className="text-primary">*</span>
                </FieldLabel>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Type your subject"
                  value={form.subject}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={
                    errors.subject ? "subject-error" : undefined
                  }
                  disabled={isSubmitting}
                  required
                />
                <FieldError id="subject-error">{errors.subject}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="message">
                  Message <span className="text-primary">*</span>
                </FieldLabel>
                <Textarea
                  id="message"
                  placeholder="Type your message"
                  rows={6}
                  value={form.message}
                  onChange={(event) =>
                    updateField("message", event.target.value)
                  }
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                  disabled={isSubmitting}
                  required
                />
                <FieldError id="message-error">{errors.message}</FieldError>
              </Field>

              <div className="flex items-center gap-3">
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="size-4" />
                      Sending
                    </span>
                  ) : (
                    "Send message"
                  )}
                </Button>
                <span className="text-muted-foreground text-xs">
                  We will never share your contact details.
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
