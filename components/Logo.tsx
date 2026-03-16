import Image from "next/image";
import logoImg from "../public/logo.png";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src={logoImg} alt="yourpc logo" className="h-11 w-11" />
      <span className="font-fjalla text-3xl">PRIMEPC</span>
    </div>
  );
}
