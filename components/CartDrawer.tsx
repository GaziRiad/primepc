import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { formatDZD } from "@/lib/utils";

const ITEMS = [
  {
    name: "Product 1",
    slug: "product-1",
    coverImage:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    finalPrice: 100,
    quantity: 1,
  },
  {
    name: "Product 1",
    slug: "product-1",
    coverImage:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    finalPrice: 100,
    quantity: 1,
  },
  {
    name: "Product 1",
    slug: "product-1",
    coverImage:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    finalPrice: 100,
    quantity: 1,
  },
];

export default function CartDrawer() {
  return (
    <Drawer direction="right">
      <DrawerTrigger className="relative cursor-pointer">
        <ShoppingCart className="stroke-1" />
        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-1 py-0 text-[10px] text-white">
          0
        </span>
      </DrawerTrigger>
      <DrawerContent className="px-8 py-8">
        <DrawerHeader className="mb-10 grid grid-cols-2 items-center justify-between border-b">
          <DrawerTitle className="text-accent text-2xl font-semibold">
            Cart View
          </DrawerTitle>
          <DrawerClose className="w-fit justify-self-end">
            {/* <Button className="text-foreground bg-transparent hover:bg-transparent focus:ring-0">
              <X className="size-6" />
            </Button> */}
          </DrawerClose>
        </DrawerHeader>

        <ul className="mx-6 flex flex-col gap-4">
          {ITEMS.map((item, index) => (
            <li key={index}>
              <div className="grid grid-cols-[20fr_60fr_20fr] items-center gap-6 font-medium">
                <div className="relative flex aspect-square h-18 max-w-18 overflow-hidden rounded-lg">
                  <Image
                    fill
                    src={item.coverImage}
                    alt={`Image of ${item.name} from PRIMEPC algeria.`}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-lg">{item.name}</p>
                  <p className="text-sm">Price: {formatDZD(item.finalPrice)}</p>
                </div>

                <Button
                  // onClick={() => toggleFavorite(item.product._id.toString())}
                  variant="secondary"
                  className="hover:bg-destructive/5 hover:text-destructive/60 flex h-11 w-11 items-center justify-center rounded-full"
                >
                  <Trash2 className="size-5 stroke-[1.5px]" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {/* <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter> */}
      </DrawerContent>
    </Drawer>
  );
}
