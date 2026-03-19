import img1 from "@/public/images/marketing1.jpg";
import img2 from "@/public/images/marketing2.jpg";
import img3 from "@/public/images/marketing3.jpg";
import Image from "next/image";

export default function FeaturedBanners() {
  return (
    <section className="mb-12 grid grid-cols-[70fr_30fr] gap-x-5">
      <div className="relative aspect-square h-120 w-full overflow-hidden rounded-lg">
        <Image
          fill
          src={img1}
          alt="banner image from PRIMEPC algeria."
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-5">
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <Image
            fill
            src={img2}
            alt="banner image from PRIMEPC algeria."
            className="object-cover"
          />
        </div>
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          <Image
            fill
            src={img3}
            alt="banner image from PRIMEPC algeria."
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
