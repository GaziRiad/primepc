import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

type LoggedInProfileProps = {
  user: {
    name: string;
    email: string;
    image: string;
  };
};

export default function LoggedInProfile({ user }: LoggedInProfileProps) {
  return (
    <div className="flex justify-center gap-2">
      <Avatar>
        <AvatarImage src={user.image} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-accent-200 text-[10px] uppercase">Account</span>
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
