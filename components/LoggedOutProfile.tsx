import { UserRound } from "lucide-react";
import Link from "next/link";

export default function LoggedOutProfile() {
  return (
    <div className="flex justify-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300">
        <UserRound size={16} />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-zinc-500 uppercase">Compte</span>
        <Link
          href="signin"
          className="hover:text-primary text-xs transition-all"
        >
          Se connecter / S’inscrire
        </Link>
      </div>
    </div>
  );
}
