import Image from "next/image";
import Link from "next/link";
import CountDownTimer from "./CountDownTimer";
import { Button } from "./ui/button";
import { getMarketingSettings } from "@/lib/marketing";

export default async function MainDiscount() {
  const { specialDeal } = await getMarketingSettings();

  if (!specialDeal.enabled) return null;

  return (
    <section className="bg-accent-700 relative mb-20 overflow-hidden rounded-lg px-4 py-10 sm:px-8 sm:py-16 md:px-10 md:py-24">
      {/* Diagonal Grid with Light */}
      <div
        className="pointer-events-none absolute inset-0 z-10 w-full opacity-75"
        style={{
          backgroundImage: `
          repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px),
        repeating-linear-gradient(-45deg, rgba(0, 0, 0, 0.1) 0, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 20px)
        `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Midnight Mist */}
      <div
        className="absolute inset-0 z-0 translate-y-1/4 md:translate-x-1/4 md:translate-y-0"
        style={{
          backgroundImage: `
          radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
        `,
        }}
      />

      <div className="relative z-20 flex flex-col items-center text-center md:block md:max-w-2xl md:text-left">
        <p className="text-accent-100 text-sm sm:text-base">
          {specialDeal.eyebrow}
        </p>
        <p className="text-primary mb-4 max-w-sm text-2xl font-semibold sm:mb-6 sm:text-4xl">
          {specialDeal.title}
        </p>
        <p className="text-background mb-6 text-sm sm:text-base">
          {specialDeal.subtitle}
        </p>

        <CountDownTimer endDate={specialDeal.endsAt} />

        <Button asChild className="w-full max-w-xs sm:w-auto">
          <Link href={specialDeal.href}>{specialDeal.ctaLabel}</Link>
        </Button>

        <div className="relative mt-8 aspect-4/3 w-full max-w-sm md:hidden">
          <Image
            fill
            src={specialDeal.image}
            alt={`Image de ${specialDeal.subtitle} sur PRIMEPC.`}
            className="object-contain"
            sizes="(max-width: 767px) 100vw, 384px"
          />
        </div>
      </div>
      <div className="pointer-events-none absolute top-1/2 right-10 z-10 hidden h-3/4 w-1/2 max-w-xl -translate-y-1/2 md:block">
        <Image
          fill
          src={specialDeal.image}
          alt={`Image de ${specialDeal.subtitle} sur PRIMEPC.`}
          className="object-contain"
          sizes="(min-width: 1024px) 480px, 50vw"
        />
      </div>
    </section>
  );
}
