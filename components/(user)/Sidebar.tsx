import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import TabList from "./TabList";
import { format } from "date-fns";

export default async function Sidebar() {
  const session = await auth();

  if (!session?.user) return null;

  const userImage = session?.user?.image ?? undefined; // convert null -> undefined

  return (
    <div className="rounded-xl border-[0.5px] bg-white shadow-xs">
      <div className="gap-4 border-b py-6">
        <div className="flex items-center gap-4 px-8">
          <Avatar className="h-14 w-14">
            <AvatarImage src={userImage} />
            <AvatarFallback>{session.user.name}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <p className="text-primary-500 mb-1 text-sm">{session.user.name}</p>
            <p className="text-xs">
              Member Since{" "}
              {format(new Date(session.user.createdAt), "MMMM dd yyyy")}
            </p>
          </div>
        </div>
      </div>
      <TabList />
    </div>
  );
}
