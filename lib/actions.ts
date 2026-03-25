"use server";

import Favorite from "@/models/Favorite";
import { auth } from "./auth";
import startDbConnection from "./db";
import { revalidatePath } from "next/cache";

// used for POST / PUT / DELETE
// FAVORITES SERVICES

export const toggleFavoritesAction = async (productId: string) => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) return;

  const deletedFavorite = await Favorite.findOneAndDelete({
    user: session.user.id,
    product: productId,
  });

  if (!deletedFavorite) {
    await Favorite.create({
      user: session.user.id,
      product: productId,
    });
  }

  // always run, for both add/remove
  revalidatePath("/", "page");
  revalidatePath("/products", "page");
};
