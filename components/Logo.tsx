import Image from "next/image";
import logoImg from "../public/logo-icon.png";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image src={logoImg} alt="yourpc logo" className="w-10 lg:w-20" />
    </Link>
  );
}
