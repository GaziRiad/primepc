"use client";

import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from "@/lib/utils";
import Link from "next/link";

const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE,
)}`;

function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className="size-14"
      fill="currentColor"
    >
      <path d="M12 4a8 8 0 0 0-6.9 12.1L4 20l3.1-1A8 8 0 1 0 12 4zm0 14a6 6 0 0 1-3.1-.85l-.23-.14-1.8.58.6-1.74-.15-.24A6 6 0 1 1 12 18zm3.3-4.7c-.18-.1-1.07-.53-1.23-.59-.16-.06-.28-.1-.4.1-.12.18-.46.59-.57.71-.11.12-.21.14-.39.04-.18-.1-.74-.27-1.42-.86-.52-.46-.87-1.03-.97-1.21-.1-.18-.01-.28.08-.38.09-.09.2-.21.3-.33.1-.12.13-.2.2-.33.07-.13.03-.25-.02-.35-.05-.1-.4-.98-.55-1.33-.15-.36-.3-.31-.4-.31l-.34-.01c-.12 0-.31.04-.48.22-.17.18-.64.63-.64 1.52s.66 1.75.75 1.87c.09.12 1.3 2 3.14 2.8.43.19.77.3 1.03.38.43.14.82.12 1.13.07.34-.05 1.07-.44 1.22-.86.15-.42.15-.79.1-.86-.05-.07-.17-.11-.35-.2z" />
    </svg>
  );
}

export default function WhatsAppButton() {
  return (
    <Link
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed right-4 bottom-4 z-50 inline-flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#20BC5A] focus-visible:ring-4 focus-visible:ring-[#25D366]/40 focus-visible:outline-none sm:right-6 sm:bottom-6"
    >
      <WhatsAppIcon />
    </Link>
  );
}
