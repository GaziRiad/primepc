"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FilterBlock({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col rounded-xl border-[0.5px] bg-white shadow-xs">
      <button
        type="button"
        className={`cursor-pointer py-3 text-left ${isOpen ? "border-b" : ""}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((curr) => !curr)}
      >
        <div className="flex w-full items-center justify-between px-5">
          <p>Price:</p>
          <ChevronDown
            size={20}
            className={`stroke-accent-300 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </div>
      </button>

      {/* Keep content mounted so close animation can play smoothly. */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className={`gap-3 px-5 py-6 transition-all duration-300 ease-in-out ${
              isOpen
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-1 opacity-0"
            }`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
