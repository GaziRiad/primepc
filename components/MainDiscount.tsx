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
    <section className="bg-accent-400 relative mb-20 rounded-lg px-10 py-24">
      <div className="max-w-4/6">
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
        className="absolute top-1/2 right-0 h-3/4 -translate-y-1/2 object-contain"
      />
    </section>
  );
}
