import type { ClientSession } from "mongoose";

import Product from "@/models/Product";

export type InventoryItem = {
  product: unknown;
  quantity: number;
  variantId?: string;
};

export const restoreOrderStock = async (
  items: InventoryItem[],
  session: ClientSession,
) => {
  for (const item of items) {
    const update = item.variantId
      ? Product.updateOne(
          { _id: item.product, "variants._id": item.variantId },
          {
            $inc: {
              stock: item.quantity,
              "variants.$.stock": item.quantity,
            },
          },
        )
      : Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity } },
        );

    const result = await update.session(session);
    if (result.modifiedCount !== 1) {
      throw new Error("stock_restore_failed");
    }
  }
};

export const reserveOrderStock = async (
  items: InventoryItem[],
  session: ClientSession,
) => {
  for (const item of items) {
    const update = item.variantId
      ? Product.updateOne(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
            variants: {
              $elemMatch: {
                _id: item.variantId,
                active: { $ne: false },
                stock: { $gte: item.quantity },
              },
            },
          },
          {
            $inc: {
              stock: -item.quantity,
              "variants.$.stock": -item.quantity,
            },
          },
        )
      : Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } },
        );

    const result = await update.session(session);
    if (result.modifiedCount !== 1) {
      throw new Error("stock_changed");
    }
  }
};
