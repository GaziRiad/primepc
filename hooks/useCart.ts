"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import {
  addToCartAction,
  clearCartAction,
  decrementFromCartAction,
  mergeGuestCartAction,
  removeFromCartAction,
} from "@/lib/actions";
import { toast } from "sonner";
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

type TCartProduct = {
  _id: string;
  id?: string;
  name?: string;
  coverImage?: string;
  finalPrice?: number;
  stock?: number;
};

type TCartItem = {
  product: TCartProduct;
  quantity: number;
};

type TCart = {
  items: TCartItem[];
  itemsCount: number;
};

type TCartProductSnapshot = {
  _id?: string;
  name?: string;
  coverImage?: string;
  finalPrice?: number;
  stock?: number;
};

const GUEST_CART_STORAGE_KEY = "guest-cart-v1";
const GUEST_CART_MERGE_LOCK_KEY = "guest-cart-merge-lock-v1";
const EMPTY_CART: TCart = { items: [], itemsCount: 0 };

const swrOptions = {
  refreshInterval: 0,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
};

const getProductId = (item: TCartItem) =>
  String(item.product?._id ?? item.product?.id ?? "");

const getItemQuantity = (cart: TCart | undefined, productId: string) =>
  cart?.items.find((item) => getProductId(item) === productId)?.quantity ?? 0;

const computeCount = (items: TCartItem[] = []) =>
  items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);

const normalizeCart = (value: unknown): TCart => {
  if (!value || typeof value !== "object") return EMPTY_CART;

  const rawItems = Array.isArray((value as { items?: unknown[] }).items)
    ? (value as { items: unknown[] }).items
    : [];

  const isCartItem = (item: TCartItem | null): item is TCartItem =>
    item !== null;

  const items: TCartItem[] = rawItems
    .map<TCartItem | null>((rawItem) => {
      if (!rawItem || typeof rawItem !== "object") return null;

      const item = rawItem as {
        product?: {
          _id?: unknown;
          id?: unknown;
          name?: unknown;
          coverImage?: unknown;
          finalPrice?: unknown;
          stock?: unknown;
        };
        quantity?: unknown;
      };

      const productId = String(item.product?._id ?? item.product?.id ?? "");
      if (!productId) return null;

      const quantity = Number(item.quantity ?? 1);

      return {
        product: {
          _id: productId,
          name:
            typeof item.product?.name === "string"
              ? item.product.name
              : undefined,
          coverImage:
            typeof item.product?.coverImage === "string"
              ? item.product.coverImage
              : undefined,
          finalPrice:
            typeof item.product?.finalPrice === "number"
              ? item.product.finalPrice
              : undefined,
          stock:
            typeof item.product?.stock === "number"
              ? item.product.stock
              : undefined,
        },
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      };
    })
    .filter(isCartItem);

  return {
    items,
    itemsCount: computeCount(items),
  };
};

const readGuestCart = (): TCart => {
  if (typeof window === "undefined") return EMPTY_CART;

  try {
    const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return EMPTY_CART;

    return normalizeCart(JSON.parse(raw));
  } catch {
    return EMPTY_CART;
  }
};

const writeGuestCart = (cart: TCart) => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    GUEST_CART_STORAGE_KEY,
    JSON.stringify({ items: cart.items }),
  );
};

export function useCart() {
  const { status, data: session } = useSession();
  const isAuthenticated = status === "authenticated";
  const hasMergedGuestRef = useRef(false);

  const key =
    status === "loading" ? null : isAuthenticated ? "/api/cart" : "guest-cart";

  const { data, mutate, isLoading } = useSWR<TCart>(
    key,
    isAuthenticated ? fetcher : async () => readGuestCart(),
    {
      ...swrOptions,
      refreshInterval: isAuthenticated ? swrOptions.refreshInterval : 0,
    },
  );

  useEffect(() => {
    if (status !== "authenticated") {
      hasMergedGuestRef.current = false;
      return;
    }

    const userId = session?.user?.id;
    if (!userId) return;

    if (hasMergedGuestRef.current) return;

    if (typeof window === "undefined") return;

    const mergeLockKey = `${GUEST_CART_MERGE_LOCK_KEY}:${userId}`;
    if (window.localStorage.getItem(mergeLockKey) === "1") return;

    const guestCart = readGuestCart();
    const payload = guestCart.items
      .map((item) => ({
        productId: getProductId(item),
        quantity: item.quantity,
      }))
      .filter((item) => item.productId && item.quantity > 0);

    hasMergedGuestRef.current = true;

    if (payload.length === 0) return;

    window.localStorage.setItem(mergeLockKey, "1");
    // Clear immediately to prevent duplicate merges from other mounted useCart instances.
    writeGuestCart(EMPTY_CART);

    const sync = async () => {
      try {
        const result = await mergeGuestCartAction(payload);
        if (!result?.ok) {
          writeGuestCart(guestCart);
          hasMergedGuestRef.current = false;
          return;
        }

        await mutate();
      } catch {
        writeGuestCart(guestCart);
        hasMergedGuestRef.current = false;
      } finally {
        window.localStorage.removeItem(mergeLockKey);
      }
    };

    void sync();
  }, [status, session?.user?.id, mutate]);

  const optimisticAdd = (
    current: TCart | undefined,
    productId: string,
    product?: TCartProductSnapshot,
  ): TCart => {
    const base: TCart = current ?? EMPTY_CART;
    const idx = base.items.findIndex(
      (item) => getProductId(item) === productId,
    );

    const existingItem = idx === -1 ? undefined : base.items[idx];
    const currentQty = existingItem?.quantity ?? 0;
    const stock =
      typeof product?.stock === "number"
        ? product.stock
        : existingItem?.product.stock;

    if (typeof stock === "number") {
      if (!Number.isFinite(stock) || stock <= 0 || currentQty >= stock) {
        return base;
      }
    }

    const nextProduct: TCartProduct = {
      _id: productId,
    };

    if (typeof product?.name === "string") nextProduct.name = product.name;
    if (typeof product?.coverImage === "string") {
      nextProduct.coverImage = product.coverImage;
    }
    if (typeof product?.finalPrice === "number") {
      nextProduct.finalPrice = product.finalPrice;
    }
    if (typeof product?.stock === "number") nextProduct.stock = product.stock;

    const items =
      idx === -1
        ? [...base.items, { product: nextProduct, quantity: 1 }]
        : base.items.map((item, itemIndex) =>
            itemIndex === idx
              ? {
                  ...item,
                  product: { ...item.product, ...nextProduct },
                  quantity: item.quantity + 1,
                }
              : item,
          );

    return { items, itemsCount: computeCount(items) };
  };

  const optimisticRemove = (
    current: TCart | undefined,
    productId: string,
  ): TCart => {
    const base: TCart = current ?? EMPTY_CART;
    const items = base.items.filter((item) => getProductId(item) !== productId);

    return { items, itemsCount: computeCount(items) };
  };

  const optimisticDecrement = (
    current: TCart | undefined,
    productId: string,
  ): TCart => {
    const base: TCart = current ?? EMPTY_CART;

    const items = base.items
      .map((item) => {
        if (getProductId(item) !== productId) return item;

        const nextQty = (item.quantity ?? 1) - 1;
        if (nextQty <= 0) return null;

        return { ...item, quantity: nextQty };
      })
      .filter((item): item is TCartItem => Boolean(item));

    return { items, itemsCount: computeCount(items) };
  };

  const addToCart = async (
    productId: string,
    product?: TCartProductSnapshot,
  ) => {
    const stockLimit =
      typeof product?.stock === "number" ? product.stock : undefined;
    const currentQty = getItemQuantity(data, productId);

    if (typeof stockLimit === "number") {
      if (!Number.isFinite(stockLimit) || stockLimit <= 0) {
        toast.error("Out of stock");
        return false;
      }

      if (currentQty >= stockLimit) {
        toast.error("Only limited stock available");
        return false;
      }
    }

    if (!isAuthenticated) {
      await mutate(
        (current) => {
          const next = optimisticAdd(current, productId, product);
          writeGuestCart(next);
          return next;
        },
        {
          revalidate: false,
          populateCache: true,
        },
      );

      return true;
    }

    try {
      await mutate(
        async (current) => {
          const result = await addToCartAction(productId);
          if (!result?.ok) {
            throw new Error(result?.reason ?? "failed");
          }
          return optimisticAdd(current, productId, product);
        },
        {
          optimisticData: (current) =>
            optimisticAdd(current, productId, product),
          rollbackOnError: true,
          revalidate: true,
        },
      );

      return true;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "";
      if (reason === "out_of_stock") {
        toast.error("Out of stock");
      } else {
        toast.error("Unable to add item to cart");
      }
      return false;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isAuthenticated) {
      await mutate(
        (current) => {
          const next = optimisticRemove(current, productId);
          writeGuestCart(next);
          return next;
        },
        {
          revalidate: false,
          populateCache: true,
        },
      );

      return true;
    }

    try {
      await mutate(
        async (current) => {
          const result = await removeFromCartAction(productId);
          if (!result?.ok) throw new Error("Failed to remove item from cart");
          return optimisticRemove(current, productId);
        },
        {
          optimisticData: (current) => optimisticRemove(current, productId),
          rollbackOnError: true,
          revalidate: true,
        },
      );

      return true;
    } catch {
      toast.error("Unable to remove item from cart");
      return false;
    }
  };

  const decrementFromCart = async (productId: string) => {
    if (!isAuthenticated) {
      await mutate(
        (current) => {
          const next = optimisticDecrement(current, productId);
          writeGuestCart(next);
          return next;
        },
        {
          revalidate: false,
          populateCache: true,
        },
      );

      return true;
    }

    try {
      await mutate(
        async (current) => {
          const result = await decrementFromCartAction(productId);
          if (!result?.ok) throw new Error("Failed to decrement item");
          return optimisticDecrement(current, productId);
        },
        {
          optimisticData: (current) => optimisticDecrement(current, productId),
          rollbackOnError: true,
          revalidate: true,
        },
      );

      return true;
    } catch {
      toast.error("Unable to update item quantity");
      return false;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      writeGuestCart(EMPTY_CART);
      await mutate(EMPTY_CART, { revalidate: false, populateCache: true });
      return true;
    }

    try {
      const result = await clearCartAction();
      if (!result?.ok) throw new Error("failed");
      await mutate();
      return true;
    } catch {
      toast.error("Unable to clear cart");
      return false;
    }
  };

  return {
    cartItems: data?.items ?? [],
    itemsCount: data?.itemsCount ?? 0,
    isLoading,
    addToCart,
    removeFromCart,
    decrementFromCart,
    clearCart,
  };
}
