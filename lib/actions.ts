"use server";

import Favorite from "@/models/Favorite";
import { auth } from "./auth";
import startDbConnection from "./db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

// used for POST / PUT / DELETE
// FAVORITES SERVICES

export const toggleFavoritesAction = async (productId: string) => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) {
    return { ok: false as const, reason: "unauthenticated" as const };
  }

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

  return { ok: true as const };
};

export const addToCartAction = async (productId: string) => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) return { ok: false as const };
  const userId = session.user.id;

  const product = await Product.findById(productId).select("stock").lean();

  const stock = Number(product?.stock ?? 0);
  if (!product || !Number.isFinite(stock) || stock <= 0) {
    return { ok: false as const, reason: "out_of_stock" as const };
  }

  const existing = await Cart.findOne({
    user: userId,
    "items.product": productId,
  })
    .select("items.$")
    .lean();

  const currentQty = existing?.items?.[0]?.quantity ?? 0;
  if (currentQty >= stock) {
    return { ok: false as const, reason: "out_of_stock" as const };
  }

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

export const decrementFromCartAction = async (productId: string) => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) return { ok: false as const };
  const userId = session.user.id;

  const decremented = await Cart.findOneAndUpdate(
    {
      user: userId,
      items: { $elemMatch: { product: productId, quantity: { $gt: 1 } } },
    },
    { $inc: { "items.$.quantity": -1 } },
    { returnDocument: "after", runValidators: true },
  );

  if (decremented) return { ok: true as const };

  await Cart.findOneAndUpdate(
    { user: userId },
    { $pull: { items: { product: productId } } },
    { returnDocument: "after", runValidators: true },
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
  //   { returnDocument: "after", runValidators: true },
  // );

  // if (decremented) return decremented;

  // 2) Otherwise remove the whole line item
  await Cart.findOneAndUpdate(
    { user: userId },
    { $pull: { items: { product: productId } } },
    { returnDocument: "after", runValidators: true },
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

    const product = await Product.findById(productId).select("stock").lean();

    const stock = Number(product?.stock ?? 0);
    if (!product || !Number.isFinite(stock) || stock <= 0) continue;

    const existing = await Cart.findOne({
      user: userId,
      "items.product": productId,
    })
      .select("items.$")
      .lean();

    const currentQty = existing?.items?.[0]?.quantity ?? 0;
    const available = stock - currentQty;

    if (available <= 0) continue;

    const quantityToAdd = Math.min(quantity, available);

    if (currentQty > 0) {
      await Cart.findOneAndUpdate(
        { user: userId, "items.product": productId },
        { $inc: { "items.$.quantity": quantityToAdd } },
        { returnDocument: "after", runValidators: true },
      );
      continue;
    }

    await Cart.findOneAndUpdate(
      { user: userId },
      {
        $setOnInsert: { user: userId },
        $push: { items: { product: productId, quantity: quantityToAdd } },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
  }

  return { ok: true as const, merged: true as const };
};

export const clearCartAction = async () => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) return { ok: false as const };

  await Cart.findOneAndUpdate(
    { user: session.user.id },
    { $set: { items: [] } },
  );

  return { ok: true as const };
};
