import Image from "next/image";
import logoImg from "../public/logo-icon.png";
import logoText from "../public/logo-text.png";
import Link from "next/link";

export default function LogoFooter() {
  return (
    <Link href="/" className="flex items-center gap-4">
      <Image
        src={logoImg}
        alt="yourpc logo"
        // className="h-9 w-9 sm:h-24 sm:w-24"
        className="sm:w-20"
      />

      <Image
        src={logoText}
        alt="yourpc logo"
        // className="h-9 w-9 sm:h-24 sm:w-24"
        className="sm:w-62"
      />
    </Link>
  );
}
