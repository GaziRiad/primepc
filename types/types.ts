import Favorite from "@/models/Favorite";
import Product from "@/models/Product";
import { InferSchemaType } from "mongoose";

export type TProduct = InferSchemaType<typeof Product.schema>;

export type TFavoriteApiItem = InferSchemaType<typeof Favorite.schema>;
