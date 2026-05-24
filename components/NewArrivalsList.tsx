import { getAllProducts } from "@/lib/services";
import ProductCard from "./ProductCard";

export default async function NewArrivalsList() {
  const products = await getAllProducts();
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4">
      {products.slice(0, 8).map((product, index) => (
        <li key={index}>
          <ProductCard product={product} large={true} />
        </li>
      ))}
    </ul>
  );
}
