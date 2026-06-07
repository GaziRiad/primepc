"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Field } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { formatDZD } from "@/lib/utils";

const FALLBACK_IMAGE = "/images/accessories.png";
const MIN_QUERY_LENGTH = 2;
const RESULTS_LIMIT = 6;

type SearchResult = {
  _id?: string;
  name: string;
  slug: string;
  coverImage?: string;
  finalPrice?: number;
  price?: number;
  discount?: number;
};

export default function SearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const nextQuery = searchParams.get("q") ?? "";
    setQuery(nextQuery);
  }, [searchParams]);

  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();

    debounceRef.current = window.setTimeout(() => {
      const run = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(
            `/api/products/search?q=${encodeURIComponent(trimmed)}&limit=${RESULTS_LIMIT}`,
            { signal: controller.signal },
          );
          if (!response.ok) return;

          const data = (await response.json()) as { items?: SearchResult[] };
          const items = Array.isArray(data.items) ? data.items : [];
          setResults(items);
          setIsOpen(true);
          setActiveIndex(items.length > 0 ? 0 : -1);
        } catch (error) {
          if ((error as { name?: string })?.name !== "AbortError") {
            setResults([]);
            setIsOpen(false);
          }
        } finally {
          setIsLoading(false);
        }
      };

      run();
    }, 250);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setActiveIndex(-1);
    router.push(`/products/${result.slug}`);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = query.trim();

    const params = new URLSearchParams(
      pathname === "/products" ? searchParams.toString() : "",
    );

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    params.delete("page");

    const basePath = "/products";
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
    setIsOpen(false);
  };

  const displayResults = useMemo(
    () => results.slice(0, RESULTS_LIMIT),
    [results],
  );

  return (
    <Field>
      <div ref={containerRef} className="relative">
        <form onSubmit={handleSubmit}>
          <InputGroup>
            <InputGroupInput
              value={query}
              type="text"
              onChange={(e) => setQuery(e.target.value)}
              id="product-search"
              placeholder="Je recherche..."
              onFocus={() => {
                if (results.length > 0) setIsOpen(true);
              }}
              onKeyDown={(event) => {
                if (!isOpen || displayResults.length === 0) return;

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((prev) =>
                    prev + 1 >= displayResults.length ? 0 : prev + 1,
                  );
                }

                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((prev) =>
                    prev - 1 < 0 ? displayResults.length - 1 : prev - 1,
                  );
                }

                if (event.key === "Enter" && activeIndex >= 0) {
                  event.preventDefault();
                  const selected = displayResults[activeIndex];
                  if (selected) handleSelect(selected);
                }

                if (event.key === "Escape") {
                  setIsOpen(false);
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="submit" aria-label="Rechercher">
                <Search />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </form>

        {isOpen && (
          <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border bg-white shadow-lg">
            {isLoading ? (
              <div className="text-accent-400 px-4 py-3 text-sm">
                Recherche en cours...
              </div>
            ) : displayResults.length === 0 ? (
              <div className="text-accent-400 px-4 py-3 text-sm">
                Aucun produit trouvé.
              </div>
            ) : (
              <ul className="max-h-72 overflow-y-auto py-2">
                {displayResults.map((result, index) => {
                  const price =
                    typeof result.finalPrice === "number"
                      ? result.finalPrice
                      : (result.price ?? 0);
                  const isActive = index === activeIndex;

                  return (
                    <li key={result.slug}>
                      <button
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSelect(result)}
                        className={`group flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left transition ${
                          isActive ? "bg-accent-100" : "hover:bg-accent-100"
                        } focus-visible:bg-accent-100 cursor-pointer focus-visible:outline-none`}
                      >
                        <div className="relative size-10 overflow-hidden rounded-md bg-zinc-100">
                          <Image
                            fill
                            src={result.coverImage || FALLBACK_IMAGE}
                            alt={result.name}
                            className="object-cover transition duration-200 group-hover:scale-[1.02]"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-foreground line-clamp-1 text-sm font-medium">
                            {result.name}
                          </p>
                          <p className="text-accent-400 text-xs">
                            {formatDZD(price)}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </Field>
  );
}
