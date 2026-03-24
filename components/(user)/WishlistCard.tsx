import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDZD, getDiscountedPrice } from "@/lib/utils";
import Image from "next/image";

import { type TProduct } from "@/types/types";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

type ProductCardProps = {
  product: TProduct;
  large?: boolean;
};

export default function WishlistCard({
  product,
  large = false,
}: ProductCardProps) {
  //   const finalPrice = getDiscountedPrice(product.price, product.discount);

  return <div></div>;
}
