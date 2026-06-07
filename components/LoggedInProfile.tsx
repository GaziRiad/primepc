import Link from "next/link";
import type { Session } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type LoggedInProfileProps = {
  user: Session["user"];
};

export default function LoggedInProfile({ user }: LoggedInProfileProps) {
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex justify-center gap-2">
      <Avatar>
        <AvatarImage src={user.image!} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-accent-200 text-[10px] uppercase">Compte</span>
        <Link
          href="/my-account"
          className="hover:text-primary text-xs transition-all"
        >
          {user.name}
        </Link>
      </div>
    </div>
  );
}
