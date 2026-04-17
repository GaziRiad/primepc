"use server";

import Favorite from "@/models/Favorite";
import { auth } from "./auth";
import startDbConnection from "./db";
import Cart from "@/models/Cart";

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
};

export const addToCartAction = async (productId: string) => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) return { ok: false as const };
  const userId = session.user.id;

  // 1) If item already exists, increment quantity
  const updated = await Cart.findOneAndUpdate(
    { user: userId, "items.product": productId },
    { $inc: { "items.$.quantity": 1 } },
    { returnDocument: "after", runValidators: true },
  );

  if (updated) return { ok: true as const };

  // 2) Else append a new item
  await Cart.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: { user: userId }, // set user if creating new cart
      $push: { items: { product: productId, quantity: 1 } },
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  return { ok: true as const };
};

export const removeFromCartAction = async (productId: string) => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) return { ok: false as const };
  const userId = session.user.id;

  // 1) Try decrement when quantity > 1
  // const decremented = await Cart.findOneAndUpdate(
  //   {
  //     user: userId,
  //     items: { $elemMatch: { product: productId, quantity: { $gt: 1 } } },
  //   },
  //   { $inc: { "items.$.quantity": -1 } },
  //   { new: true, runValidators: true },
  // );

  // if (decremented) return decremented;

  // 2) Otherwise remove the whole line item
  await Cart.findOneAndUpdate(
    { user: userId },
    { $pull: { items: { product: productId } } },
    { new: true, runValidators: true },
  );

  return { ok: true as const };
};

type TGuestCartSyncItem = {
  productId: string;
  quantity: number;
};

export const mergeGuestCartAction = async (items: TGuestCartSyncItem[]) => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) return { ok: false as const, merged: false as const };
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: true as const, merged: false as const };
  }

  const userId = session.user.id;

  for (const item of items) {
    const productId = String(item.productId ?? "");
    const quantity = Math.floor(Number(item.quantity ?? 0));

    if (!productId || !Number.isFinite(quantity) || quantity <= 0) continue;

    const updated = await Cart.findOneAndUpdate(
      { user: userId, "items.product": productId },
      { $inc: { "items.$.quantity": quantity } },
      { returnDocument: "after", runValidators: true },
    );

    if (updated) continue;

    await Cart.findOneAndUpdate(
      { user: userId },
      {
        $setOnInsert: { user: userId },
        $push: { items: { product: productId, quantity } },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
  }

  return { ok: true as const, merged: true as const };
};
