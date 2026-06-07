"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ProductVariationImageContextValue = {
  selectedImage: string;
  setSelectedImage: (image: string) => void;
};

const ProductVariationImageContext =
  createContext<ProductVariationImageContextValue | null>(null);

export function ProductVariationImageProvider({
  children,
  defaultImage,
}: {
  children: ReactNode;
  defaultImage: string;
}) {
  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const value = useMemo(
    () => ({ selectedImage, setSelectedImage }),
    [selectedImage],
  );

  return (
    <ProductVariationImageContext.Provider value={value}>
      {children}
    </ProductVariationImageContext.Provider>
  );
}

export const useProductVariationImage = () =>
  useContext(ProductVariationImageContext);
