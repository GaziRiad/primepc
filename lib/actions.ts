"use server";

import Favorite from "@/models/Favorite";
import { auth } from "./auth";
import startDbConnection from "./db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import {
  cancelAbandonedCartReminder,
  syncAbandonedCartReminder,
} from "@/lib/cartRecovery";

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

export const removeFavoriteAction = async (productId: string) => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) {
    return { ok: false as const, reason: "unauthenticated" as const };
  }

  await Favorite.findOneAndDelete({
    user: session.user.id,
    product: productId,
  });

  return { ok: true as const };
};

const getCartLineMatch = (productId: string, variantId = "") => ({
  product: productId,
  ...(variantId
    ? { variantId }
    : { $or: [{ variantId: "" }, { variantId: { $exists: false } }] }),
});

const getPurchasableStock = async (productId: string, variantId = "") => {
  const product = await Product.findById(productId)
    .select("stock variants")
    .lean();

  if (!product) return { ok: false as const, reason: "out_of_stock" as const };

  const variants = Array.isArray(product.variants) ? product.variants : [];
  if (variants.length > 0) {
    if (!variantId) {
      return { ok: false as const, reason: "variant_required" as const };
    }

    const variant = variants.find(
      (candidate: { _id?: unknown; active?: boolean }) =>
        String(candidate._id ?? "") === variantId && candidate.active !== false,
    );
    const stock = Number(variant?.stock ?? 0);
    if (!variant || !Number.isFinite(stock) || stock <= 0) {
      return { ok: false as const, reason: "out_of_stock" as const };
    }

    return { ok: true as const, stock };
  }

  const stock = Number(product.stock ?? 0);
  if (!Number.isFinite(stock) || stock <= 0) {
    return { ok: false as const, reason: "out_of_stock" as const };
  }

  return { ok: true as const, stock };
};

export const addToCartAction = async (productId: string, variantId = "") => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) return { ok: false as const };
  const userId = session.user.id;

  const purchasable = await getPurchasableStock(productId, variantId);
  if (!purchasable.ok) return purchasable;
  const stock = purchasable.stock;

  const existing = await Cart.findOne({ user: userId }).select("items").lean();

  const currentQty =
    existing?.items?.find(
      (item: { product?: unknown; variantId?: string }) =>
        String(item.product ?? "") === productId &&
        String(item.variantId ?? "") === variantId,
    )?.quantity ?? 0;
  if (currentQty >= stock) {
    return { ok: false as const, reason: "out_of_stock" as const };
  }

  // 1) If item already exists, increment quantity
  const updated = await Cart.findOneAndUpdate(
    {
      user: userId,
      items: { $elemMatch: getCartLineMatch(productId, variantId) },
    },
    { $inc: { "items.$.quantity": 1 } },
    { returnDocument: "after", runValidators: true },
  );

  if (updated) {
    await syncAbandonedCartReminder(userId).catch(() => null);
    return { ok: true as const };
  }

  // 2) Else append a new item
  await Cart.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: { user: userId }, // set user if creating new cart
      $push: { items: { product: productId, variantId, quantity: 1 } },
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  await syncAbandonedCartReminder(userId).catch(() => null);
  return { ok: true as const };
};

export const decrementFromCartAction = async (
  productId: string,
  variantId = "",
) => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) return { ok: false as const };
  const userId = session.user.id;

  const decremented = await Cart.findOneAndUpdate(
    {
      user: userId,
      items: {
        $elemMatch: {
          ...getCartLineMatch(productId, variantId),
          quantity: { $gt: 1 },
        },
      },
    },
    { $inc: { "items.$.quantity": -1 } },
    { returnDocument: "after", runValidators: true },
  );

  if (decremented) {
    await syncAbandonedCartReminder(userId).catch(() => null);
    return { ok: true as const };
  }

  await Cart.findOneAndUpdate(
    { user: userId },
    { $pull: { items: getCartLineMatch(productId, variantId) } },
    { returnDocument: "after", runValidators: true },
  );

  await syncAbandonedCartReminder(userId).catch(() => null);
  return { ok: true as const };
};

export const removeFromCartAction = async (
  productId: string,
  variantId = "",
) => {
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
    { $pull: { items: getCartLineMatch(productId, variantId) } },
    { returnDocument: "after", runValidators: true },
  );

  await syncAbandonedCartReminder(userId).catch(() => null);
  return { ok: true as const };
};

type TGuestCartSyncItem = {
  productId: string;
  quantity: number;
  variantId?: string;
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
    const variantId = String(item.variantId ?? "");

    if (!productId || !Number.isFinite(quantity) || quantity <= 0) continue;

    const purchasable = await getPurchasableStock(productId, variantId);
    if (!purchasable.ok) continue;
    const stock = purchasable.stock;

    const existing = await Cart.findOne({ user: userId })
      .select("items")
      .lean();

    const currentQty =
      existing?.items?.find(
        (cartItem: { product?: unknown; variantId?: string }) =>
          String(cartItem.product ?? "") === productId &&
          String(cartItem.variantId ?? "") === variantId,
      )?.quantity ?? 0;
    const available = stock - currentQty;

    if (available <= 0) continue;

    const quantityToAdd = Math.min(quantity, available);

    if (currentQty > 0) {
      await Cart.findOneAndUpdate(
        {
          user: userId,
          items: { $elemMatch: getCartLineMatch(productId, variantId) },
        },
        {
          $inc: { "items.$.quantity": quantityToAdd },
        },
        { returnDocument: "after", runValidators: true },
      );
      continue;
    }

    await Cart.findOneAndUpdate(
      { user: userId },
      {
        $setOnInsert: { user: userId },
        $push: {
          items: { product: productId, variantId, quantity: quantityToAdd },
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
  }

  await syncAbandonedCartReminder(userId).catch(() => null);
  return { ok: true as const, merged: true as const };
};

export const clearCartAction = async () => {
  await startDbConnection();

  const session = await auth();

  if (!session?.user) return { ok: false as const };

  await cancelAbandonedCartReminder(session.user.id).catch(() => null);
  await Cart.findOneAndUpdate(
    { user: session.user.id },
    { $set: { items: [] } },
  );

  return { ok: true as const };
};
