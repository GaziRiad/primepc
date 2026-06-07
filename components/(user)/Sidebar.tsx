import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import TabList from "./TabList";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type SidebarUser = {
  name?: string | null;
  image?: string | null;
  createdAt?: Date | string | number | null;
};

type SidebarProps = {
  user: SidebarUser;
};

export default function Sidebar({ user }: SidebarProps) {
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const createdAt = user.createdAt ? new Date(user.createdAt) : null;

  return (
    <div className="rounded-xl border-[0.5px] bg-white shadow-xs">
      <div className="gap-4 border-b py-6">
        <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <p className="text-primary-500 mb-1 text-sm">{user.name}</p>
            <p className="text-xs">
              Membre depuis{" "}
              {createdAt
                ? format(createdAt, "dd MMMM yyyy", { locale: fr })
                : "-"}
            </p>
          </div>
        </div>
      </div>
      <TabList />
    </div>
  );
}
