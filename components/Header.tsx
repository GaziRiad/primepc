import { Heart, ShoppingCart, UserRound } from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="border-b py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-[25fr_35fr_40fr]">
        <Logo />

        <SearchBar />
        <div className="ml-auto flex max-w-md items-center justify-between gap-8">
          <div className="flex justify-center">
            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full border border-gray-300">
              <UserRound size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase">
                Account
              </span>
              <span className="text-xs">Sign in / Register</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative cursor-pointer">
              <Heart size={20} />
              <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-1 py-0 text-[10px] text-white">
                0
              </span>
            </div>
            <div className="relative cursor-pointer">
              <ShoppingCart size={20} />
              <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-1 py-0 text-[10px] text-white">
                0
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
