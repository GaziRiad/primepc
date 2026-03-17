import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDZD, getDiscountedPrice } from "@/lib/utils";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

import { type Product } from "@/lib/types";

type ProductCardProps = {
  product: Product;
  newArrival?: boolean;
};

export default function ProductCard({ product, newArrival }: ProductCardProps) {
  const finalPrice = getDiscountedPrice(product.price, product.discount);

  return (
    <Card className="py-10 transition-all hover:shadow-md">
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
        <p className="-mb-1 text-xs text-zinc-500 uppercase">{product.brand}</p>
        <p className="mb-2">{product.title}</p>

        {newArrival && (
          <Badge className="mb-4 bg-blue-600" variant="default">
            Latest & Greatest
          </Badge>
        )}

        <div className="mb-6 flex items-center gap-2">
          <p className="text-base font-semibold">{formatDZD(finalPrice)}</p>
          {product.discount > 0 && (
            <>
              <p className="text-sm text-zinc-500 line-through">
                {formatDZD(product.price)}
              </p>
              <Badge variant="secondary">-{product.discount}%</Badge>
            </>
          )}
        </div>

        <Button className="cursor-pointer">Add to cart</Button>
      </CardFooter>
    </Card>
  );
}
