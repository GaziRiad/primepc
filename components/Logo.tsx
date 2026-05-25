import Image from "next/image";
import logoImg from "../public/logo.png";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src={logoImg}
        alt="yourpc logo"
        className="h-9 w-9 sm:h-12 sm:w-12"
      />
      <span className="font-fjalla text-primary text-2xl sm:text-3xl">
        PRIMEPC
      </span>
    </Link>
  );
}
