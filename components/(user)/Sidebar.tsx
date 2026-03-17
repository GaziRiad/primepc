import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import TabList from "./TabList";

export default function Sidebar() {
  return (
    <div className="rounded-xl border-[0.5px] bg-white shadow-xs">
      <div className="gap-4 border-b py-6">
        <div className="flex items-center gap-4 px-8">
          <Avatar className="h-14 w-14">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <p className="text-primary-500 mb-1 text-sm">Riad Hallouch</p>
            <p className="text-xs">Member Since Sep 2020</p>
          </div>
        </div>
      </div>
      <TabList />
    </div>
  );
}
