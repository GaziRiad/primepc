import { Heart, ShoppingCart } from "lucide-react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import LoggedOutProfile from "./LoggedOutProfile";
import LoggedInProfile from "./LoggedInProfile";
import Navigation from "./Navigation";
import { auth } from "@/lib/auth";

export default async function Header() {
  const session = await auth();

  return (
    <header className="">
      <div className="border-b py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-[25fr_35fr_40fr]">
          <Logo />

          <SearchBar />
          <div className="ml-auto flex max-w-md items-center justify-between gap-8">
            {session?.user ? (
              <LoggedInProfile user={session.user} />
            ) : (
              <LoggedOutProfile />
            )}

            <div className="flex items-center gap-2.5">
              <div className="relative cursor-pointer">
                <Heart className="stroke-1" />
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-1 py-0 text-[10px] text-white">
                  0
                </span>
              </div>
              <div className="relative cursor-pointer">
                <ShoppingCart className="stroke-1" />
                <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-1 py-0 text-[10px] text-white">
                  0
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Navigation />
    </header>
  );
}
