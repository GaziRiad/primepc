import Image from "next/image";
import CountDownTimer from "./CountDownTimer";
import { Button } from "./ui/button";

const EventProduct = {
  title: "MacBook Air (M5, 2026)",
  image: "/images/sutdy.png",
  discountEnds: "2026-03-26T23:59:59Z",
};

export default function MainDiscount() {
  return (
    <section className="bg-accent-400 relative mb-20 overflow-hidden rounded-lg px-6 py-16 md:px-10 md:py-24">
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
        className="absolute inset-0 z-0 translate-x-1/4"
        style={{
          backgroundImage: `
          radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
          radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
          radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
        `,
        }}
      />

      <div className="relative z-20 max-w-full md:max-w-4/6">
        <p className="text-accent-100">Don&apos;t Miss!!</p>
        <p className="text-primary mb-6 max-w-sm text-4xl font-semibold">
          Enhance Your Work Experience
        </p>
        <p className="text-background mb-6">MacBook Air (M5, 2026)</p>

        <CountDownTimer endDate={EventProduct.discountEnds} />

        <Button>Check it out!</Button>
      </div>
      <Image
        width={800}
        height={800}
        src={EventProduct.image}
        alt={`Image of ${EventProduct.title} from PRIMEPC.`}
        className="pointer-events-none absolute top-1/2 right-0 z-10 hidden h-3/4 -translate-y-1/2 object-contain md:block"
      />
    </section>
  );
}
