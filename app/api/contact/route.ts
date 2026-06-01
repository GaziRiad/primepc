import { NextResponse } from "next/server";

import { sendContactMessage } from "@/lib/notifications";

type ContactPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  company?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalize = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export async function POST(request: Request) {
  let body: ContactPayload | null = null;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ message: "Requete invalide." }, { status: 400 });
  }

  const firstName = normalize(body?.firstName);
  const lastName = normalize(body?.lastName);
  const email = normalize(body?.email).toLowerCase();
  const phone = normalize(body?.phone);
  const subject = normalize(body?.subject).replace(/[\r\n]+/g, " ");
  const message = normalize(body?.message);
  const company = normalize(body?.company);

  const errors: Record<string, string> = {};
  const phoneDigits = phone.replace(/\D/g, "");

  if (!firstName) {
    errors.firstName = "Le prenom est obligatoire.";
  }

  if (!lastName) {
    errors.lastName = "Le nom est obligatoire.";
  }

  if (!email) {
    errors.email = "L'email est obligatoire.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Entrez une adresse email valide.";
  }

  if (!phone) {
    errors.phone = "Le numero de telephone est obligatoire.";
  } else if (phoneDigits.length < 7) {
    errors.phone = "Entrez un numero de telephone valide.";
  }

  if (!subject) {
    errors.subject = "Le sujet est obligatoire.";
  } else if (subject.length < 3) {
    errors.subject = "Le sujet doit contenir au moins 3 caracteres.";
  }

  if (!message) {
    errors.message = "Le message est obligatoire.";
  } else if (message.length < 10) {
    errors.message = "Le message doit contenir au moins 10 caracteres.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { message: "Merci de corriger les champs en rouge.", errors },
      { status: 400 },
    );
  }

  if (company) {
    return NextResponse.json({ ok: true });
  }

  const result = await sendContactMessage({
    firstName,
    lastName,
    email,
    phone,
    subject,
    message,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        message:
          "Le service email n'est pas configure. Verifiez RESEND_API_KEY et RESEND_FROM.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
