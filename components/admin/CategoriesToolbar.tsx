"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CategoriesToolbarProps = {
  initialQuery?: string;
};

export default function CategoriesToolbar({
  initialQuery = "",
}: CategoriesToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const updateParams = (nextQuery: string) => {
    const params = new URLSearchParams();
    const trimmed = nextQuery.trim();
    if (trimmed) params.set("q", trimmed);

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams(query);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
      <form onSubmit={handleSubmit} className="flex w-full flex-1 gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Rechercher des catégories..."
          className="w-full"
        />
        <Button type="submit" variant="outline">
          Rechercher
        </Button>
      </form>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <Button asChild>
          <Link href="/admin/categories/new">Nouvelle catégorie</Link>
        </Button>
      </div>
    </div>
  );
}
