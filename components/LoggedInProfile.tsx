import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function LoggedInProfile() {
  return (
    <div className="flex justify-center gap-2">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-accent-200 text-[10px] uppercase">Account</span>
        <Link
          href="/my-account"
          className="hover:text-primary text-xs transition-all"
        >
          Riad Hallouch
        </Link>
      </div>
    </div>
  );
}
