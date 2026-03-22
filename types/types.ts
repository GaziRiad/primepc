export type Product = {
  name: string;
  slug: string;
  brand: string;
  description?: string;
  price: number;
  discount: number;
  finalPrice: number;
  coverImage: string;
  images?: string;
  specs?: [string];
  categories?: string[];
  createdAt: Date;
};
