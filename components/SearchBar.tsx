"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  return (
    <div className="relative h-10 rounded-full border">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ..."
        className="h-full w-full rounded-full border-0 pr-12 pl-4 outline-none placeholder:text-sm"
      />
      <Search
        size={20}
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
      />
    </div>
  );
}
