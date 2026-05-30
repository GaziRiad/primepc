import { type TProduct } from "@/types/types";
import ProductCardClient from "./ProductCardClient";

type ProductCardProps = {
  product: TProduct;
  large?: boolean;
  badge?: boolean;
};

export default function ProductCard({
  product,
  large = false,
  badge = false,
}: ProductCardProps) {
  return (
    <ProductCardClient
      productId={String(product._id)}
      name={product.name}
      brand={product.brand}
      slug={product.slug}
      coverImage={product.coverImage}
      images={product.images ?? []}
      price={product.price}
      finalPrice={product.finalPrice}
      discount={product.discount}
      stock={product.stock}
      large={large}
      badge={badge}
    />
  );
}
