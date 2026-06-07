"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDZD } from "@/lib/utils";

const FALLBACK_IMAGE = "/images/accessories.png";

type ProductRow = {
  _id: string;
  name: string;
  slug: string;
  brand?: string;
  price?: number;
  finalPrice?: number;
  discount?: number;
  stock?: number;
  coverImage?: string;
  topSeller?: boolean;
  updatedAt?: string;
};

type ProductsTableProps = {
  products: ProductRow[];
};

export default function ProductsTable({ products }: ProductsTableProps) {
  const normalizeId = (value: unknown) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      const oid = (value as { $oid?: string }).$oid;
      if (typeof oid === "string") return oid;
      const id = (value as { id?: string }).id;
      if (typeof id === "string") return id;
      const nested = (value as { _id?: unknown })._id;
      if (typeof nested === "string") return nested;
      if (typeof nested === "object" && nested) {
        const nestedOid = (nested as { $oid?: string }).$oid;
        if (typeof nestedOid === "string") return nestedOid;
      }
      if (
        typeof (value as { toString?: () => string }).toString === "function"
      ) {
        return (value as { toString: () => string }).toString();
      }
    }
    const stringified = String(value);
    const match = stringified.match(/[a-f0-9]{24}/i);
    return match ? match[0] : stringified;
  };

  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const rows = useMemo(() => {
    const mapped = products.map((product) => ({
      ...product,
      _id: normalizeId(product._id),
    }));

    if (deletedIds.length === 0) {
      return mapped;
    }

    return mapped.filter((row) => !deletedIds.includes(row._id));
  }, [products, deletedIds]);

  const handleDelete = async (productId: string) => {
    if (!productId) return;
    if (
      !window.confirm("Supprimer ce produit ? Cette action est irréversible.")
    )
      return;

    setDeletingId(productId);
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        toast.error(data?.error || "Impossible de supprimer le produit.");
        return;
      }

      setDeletedIds((current) =>
        current.includes(productId) ? current : [...current, productId],
      );
      toast.success("Produit supprimé.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl border bg-white shadow-xs">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Produits</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Gérez le catalogue, les prix et le stock.
          </p>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Mis à jour</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Aucun produit trouvé.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((product) => {
              const cover = product.coverImage || FALLBACK_IMAGE;
              const stock = Number(product.stock ?? 0);
              const isOut = !Number.isFinite(stock) || stock <= 0;

              return (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-zinc-100">
                        <Image
                          fill
                          src={cover}
                          alt={product.name}
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground truncate font-medium">
                          {product.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {product.brand || "Marque"}
                        </p>
                        {product.topSeller && (
                          <Badge className="mt-1 border-amber-300 bg-amber-100 text-amber-900">
                            Top seller
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">
                      {formatDZD(Number(product.finalPrice ?? 0))}
                    </div>
                    {Number(product.discount ?? 0) > 0 && (
                      <div className="text-muted-foreground text-xs line-through">
                        {formatDZD(Number(product.price ?? 0))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isOut ? "destructive" : "secondary"}
                      className={isOut ? "" : "bg-emerald-100 text-emerald-700"}
                    >
                      {isOut ? "Rupture de stock" : `${stock} en stock`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {product.updatedAt
                      ? new Date(product.updatedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/products/${product._id}`}>
                          Modifier
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/products/${product.slug}`}>Voir</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingId === product._id}
                      >
                        Supprimer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
