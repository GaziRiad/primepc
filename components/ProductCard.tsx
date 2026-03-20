import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDZD, getDiscountedPrice } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

import { type Product } from "@/types/types";
import { Heart } from "lucide-react";
import Link from "next/link";

type ProductCardProps = {
  product: Product;
  large?: boolean;
};

export default function ProductCard({
  product,
  large = false,
}: ProductCardProps) {
  const finalPrice = getDiscountedPrice(product.price, product.discount);

  return (
    <Card
      size={!large ? "sm" : "default"}
      className={`h-full py-10 transition-all ${large ? "hover:shadow-lg" : "rounded-sm hover:shadow-md"} `}
    >
      <CardContent className="flex items-center justify-center">
        <div className="relative flex aspect-square w-3/4">
          <Image
            fill
            src={product.coverImage}
            alt={`Image of ${product.name} from PRIMEPC algeria.`}
            className="object-cover"
          />
        </div>
      </CardContent>
      <CardFooter className="flex h-full flex-col items-start">
        <p className="text-accent-400 -mb-1 text-xs uppercase">
          {product.brand}
        </p>
        <Link
          href={`/products/${product.slug}`}
          className="mb-2 underline-offset-2 transition-all hover:underline"
        >
          {product.name}
        </Link>

        {large && (
          <Badge className="mb-2 bg-blue-600" variant="default">
            Latest & Greatest
          </Badge>
        )}

        <div
          className={`mb-6 flex gap-0 ${large ? "flex-row gap-2" : "flex-col gap-0"}`}
        >
          <p className="text-base font-semibold">{formatDZD(finalPrice)}</p>
          {product.discount > 0 && (
            <div className="flex items-center gap-2">
              <p className="text-accent-300 text-sm line-through">
                {formatDZD(product.price)}
              </p>
              <Badge variant="secondary">-{product.discount}%</Badge>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center gap-2">
          <Button size={large ? "default" : "sm"} className="cursor-pointer">
            Add to cart
          </Button>
          <Heart
            className={`hover:color-red-600 cursor-pointer stroke-1 transition-all hover:fill-red-600 hover:stroke-red-600 ${large ? "" : "size-5"}`}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
