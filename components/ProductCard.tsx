import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDZD, getDiscountedPrice } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

import { type Product } from "@/lib/types";
import { Heart } from "lucide-react";
import Link from "next/link";

type ProductCardProps = {
  product: Product;
  newArrival?: boolean;
};

export default function ProductCard({ product, newArrival }: ProductCardProps) {
  const finalPrice = getDiscountedPrice(product.price, product.discount);

  return (
    <Card className="py-10 transition-all hover:shadow-lg">
      <CardContent className="flex items-center justify-center">
        <div className="relative flex aspect-square w-3/4">
          <Image
            fill
            src={product.image}
            alt={`Image of ${product.title} from PRIMEPC algeria.`}
            className="object-contain"
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-accent-400 -mb-1 text-xs uppercase">
          {product.brand}
        </p>
        <Link
          href={product.href}
          className="mb-2 underline-offset-2 transition-all hover:underline"
        >
          {product.title}
        </Link>

        {newArrival && (
          <Badge className="mb-4 bg-blue-600" variant="default">
            Latest & Greatest
          </Badge>
        )}

        <div className="mb-6 flex items-center gap-2">
          <p className="text-base font-semibold">{formatDZD(finalPrice)}</p>
          {product.discount > 0 && (
            <>
              <p className="text-accent-300 text-sm line-through">
                {formatDZD(product.price)}
              </p>
              <Badge variant="secondary">-{product.discount}%</Badge>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button className="cursor-pointer">Add to cart</Button>
          <Heart className="hover:color-red-600 cursor-pointer stroke-1 transition-all hover:fill-red-600 hover:stroke-red-600" />
        </div>
      </CardFooter>
    </Card>
  );
}
