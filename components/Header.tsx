import { Heart, ShoppingCart } from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import LoggedOutProfile from "./LoggedOutProfile";
import LoggedInProfile from "./LoggedInProfile";

export default function Header() {
  return (
    <header className="border-b py-8">
      <div className="mx-auto grid max-w-6xl grid-cols-[25fr_35fr_40fr]">
        <Logo />

        <SearchBar />
        <div className="ml-auto flex max-w-md items-center justify-between gap-8">
          <LoggedOutProfile />
          {/* <LoggedInProfile /> */}

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
