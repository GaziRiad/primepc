"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Filters from "./Filters";

type FiltersDrawerProps = {
  categories: { name: string; slug: string; image?: string }[];
};

export default function FiltersDrawer({ categories }: FiltersDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer direction="left" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-0">
        <DrawerHeader className="flex items-center justify-between border-b px-4 py-3">
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Close filters">
              <X className="size-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6">
          <Filters categories={categories} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
