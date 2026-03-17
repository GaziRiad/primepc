"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  console.log(query);

  return (
    <Field>
      <InputGroup>
        <InputGroupInput
          value={query}
          type="text"
          onChange={(e) => setQuery(e.target.value)}
          id="input-group-url"
          placeholder="Search ..."
        />
        <InputGroupAddon align="inline-end">
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}
