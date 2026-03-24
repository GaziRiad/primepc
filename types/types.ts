// export type Product = {
//   name: string;
//   slug: string;
//   brand: string;
//   description?: string;
//   price: number;
//   discount: number;
//   finalPrice: number;
//   coverImage: string;
//   images?: string;
//   specs?: [string];
//   categories?: string[];
//   createdAt: Date;
// };

import Favorite from "@/models/Favorite";
import Product from "@/models/Product";
import { InferSchemaType } from "mongoose";

export type TProduct = InferSchemaType<typeof Product.schema>;

export type TFavoriteApiItem = InferSchemaType<typeof Favorite.schema>;
