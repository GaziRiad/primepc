"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/hooks/useCart";
import { formatDZD } from "@/lib/utils";
import Breadcrumbs from "@/components/Breadcrumbs";

const SHIPPING_THRESHOLD = 40000;
const SHIPPING_FEE = 500;

export default function CartPage() {
  const { cartItems, isLoading, addToCart, decrementFromCart, removeFromCart } =
    useCart();

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product.finalPrice ?? 0) * item.quantity,
    0,
  );

  const shipping =
    subtotal >= SHIPPING_THRESHOLD ? 0 : subtotal > 0 ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  const handleClearCart = async () => {
    for (const item of cartItems) {
      const rawId = item.product?._id ?? item.product?.id;
      const productId = rawId ? String(rawId) : "";
      if (!productId) continue;
      await removeFromCart(productId, item.variantId);
    }
  };

  const hasItems = cartItems.length > 0;

  return (
    <div>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3">
          <Breadcrumbs
            items={[{ label: "Accueil", href: "/" }, { label: "Panier" }]}
          />
          <h2 className="text-accent text-xl font-semibold sm:text-2xl">
            Votre panier
          </h2>
        </div>
        {hasItems && (
          <Button
            variant="link"
            className="h-auto border-0 p-0 text-xs font-normal no-underline! sm:text-sm"
            onClick={handleClearCart}
          >
            Vider le panier
          </Button>
        )}
      </div>

      <section className="bg-accent-50 py-14">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="flex min-h-40 items-center justify-center rounded-xl border-[0.5px] bg-white shadow-xs">
              <div className="text-muted-foreground flex items-center gap-3 text-sm">
                <Spinner className="size-5" />
                Chargement de votre panier...
              </div>
            </div>
          )}

          {!isLoading && !hasItems && (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-xl border-[0.5px] bg-white shadow-xs">
              <p className="text-muted-foreground text-lg">
                Votre panier est vide.
              </p>
              <Button
                asChild
                className="bg-primary-800 hover:bg-primary-700 h-11 rounded-full text-white"
              >
                <Link href="/products">Parcourir les produits</Link>
              </Button>
            </div>
          )}

          {!isLoading && hasItems && (
            <div className="rounded-xl border-[0.5px] bg-white shadow-xs">
              <ul className="divide-y">
                {cartItems.map((item, index) => {
                  const rawId = item.product?._id ?? item.product?.id;
                  const productId = rawId ? String(rawId) : "";
                  const canInteract = Boolean(productId);
                  const variantId = String(item.variantId ?? "");
                  const price = item.product.finalPrice ?? 0;
                  const stock =
                    typeof item.product.stock === "number"
                      ? item.product.stock
                      : undefined;
                  const canIncrease =
                    canInteract &&
                    (typeof stock === "number" ? item.quantity < stock : true);

                  return (
                    <li
                      key={`${productId || "item"}-${variantId}-${index}`}
                      className="p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative flex aspect-square h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                          <Image
                            fill
                            src={
                              item.product.coverImage ??
                              "/images/accessories.png"
                            }
                            alt={`Image de ${item.product.name ?? "l’article du panier"} sur PRIMEPC Algérie.`}
                            className="object-cover"
                            unoptimized={/^https?:\/\//i.test(
                              item.product.coverImage ?? "",
                            )}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-primary-700 line-clamp-2 text-sm font-medium">
                            {item.product.name ?? "Produit inconnu"}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {formatDZD(price)}
                          </p>
                          {item.variantLabel && (
                            <p className="text-muted-foreground mt-1 text-xs">
                              {item.variantLabel}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          aria-label="Retirer l’article du panier"
                          onClick={() =>
                            canInteract && removeFromCart(productId, variantId)
                          }
                          variant="secondary"
                          disabled={!canInteract}
                          className="hover:bg-destructive/5 hover:text-destructive/60 h-8 w-8 rounded-full"
                        >
                          <Trash2 className="size-4 stroke-[1.5px]" />
                        </Button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            aria-label="Diminuer la quantité"
                            onClick={() =>
                              canInteract &&
                              decrementFromCart(productId, variantId)
                            }
                            variant="secondary"
                            disabled={!canInteract}
                            className="hover:bg-accent-100 flex h-8 w-8 items-center justify-center rounded-full"
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="w-6 text-center text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            aria-label="Augmenter la quantité"
                            onClick={() =>
                              canInteract &&
                              addToCart(
                                productId,
                                {
                                  name: item.product.name,
                                  coverImage: item.product.coverImage,
                                  finalPrice: item.product.finalPrice,
                                  stock: item.product.stock,
                                },
                                variantId
                                  ? {
                                      id: variantId,
                                      label: item.variantLabel,
                                      options: item.variantOptions,
                                    }
                                  : undefined,
                              )
                            }
                            variant="secondary"
                            disabled={!canIncrease}
                            className="hover:bg-accent-100 flex h-8 w-8 items-center justify-center rounded-full"
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>
                        <span className="text-sm font-semibold">
                          {formatDZD(price * item.quantity)}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {!isLoading && hasItems && (
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
                <h3 className="text-accent text-lg font-semibold">
                  Vous avez un code promo ?
                </h3>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Input
                    placeholder="Saisissez un code promo"
                    className="h-11 rounded-full"
                  />
                  <Button
                    className="bg-primary-400 hover:bg-primary-500 h-11 rounded-full px-6 text-white"
                    type="button"
                  >
                    Appliquer
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border-[0.5px] bg-white px-6 py-6 shadow-xs">
                <h3 className="text-accent text-lg font-semibold">
                  Récapitulatif de la commande
                </h3>
                <div className="mt-4 border-y border-dashed py-4">
                  <div className="text-muted-foreground flex items-center justify-between text-[11px] font-semibold tracking-wide uppercase">
                    <span>Produit</span>
                    <span>Total</span>
                  </div>
                  <ul className="mt-3 flex flex-col gap-3 text-sm">
                    {cartItems.map((item, index) => {
                      const rawId = item.product?._id ?? item.product?.id;
                      const productId = rawId ? String(rawId) : "";
                      const price = item.product.finalPrice ?? 0;
                      const total = price * item.quantity;

                      return (
                        <li
                          key={`${productId || "item"}-${index}`}
                          className="flex items-start justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-primary-700 line-clamp-1 font-medium">
                              {item.product.name ?? "Produit inconnu"}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              x{item.quantity}
                            </p>
                          </div>
                          <span className="font-semibold">
                            {formatDZD(total)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="mt-5 flex flex-col gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Sous-total</span>
                    <span className="font-semibold">{formatDZD(subtotal)}</span>
                  </div>
                  <div className="text-muted-foreground flex items-center justify-between">
                    <span>Livraison</span>
                    <span>
                      {shipping === 0 ? "Gratuit" : formatDZD(shipping)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4 text-base">
                    <span className="font-semibold">Total</span>
                    <span className="text-primary-800 font-semibold">
                      {formatDZD(total)}
                    </span>
                  </div>
                </div>

                <Button
                  asChild
                  className="bg-primary-800 hover:bg-primary-700 mt-6 h-12 w-full rounded-full text-white"
                >
                  <Link href="/checkout">Passer la commande</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
