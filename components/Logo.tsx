import Image from "next/image";
import logoImg from "../public/logo.png";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src={logoImg} alt="yourpc logo" className="h-12 w-12" />
      <span className="text-3xl">PRIMEPC</span>
    </div>
  );
}
