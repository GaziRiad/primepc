import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function LoggedInProfile() {
  return (
    <div className="flex justify-center gap-3">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-[10px] text-zinc-500 uppercase">Account</span>
        <Link href="/profile" className="text-xs transition-all">
          Riad Hallouch
        </Link>
      </div>
    </div>
  );
}
