/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
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
    if (!window.confirm("Delete this product? This cannot be undone.")) return;

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
        toast.error(data?.error || "Unable to delete product.");
        return;
      }

      setDeletedIds((current) =>
        current.includes(productId) ? current : [...current, productId],
      );
      toast.success("Product deleted.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl border bg-white shadow-xs">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Products</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage product catalog, pricing, and inventory.
          </p>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                No products found.
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
                      <img
                        src={cover}
                        alt={product.name}
                        className="h-12 w-12 rounded-xl object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="text-foreground truncate font-medium">
                          {product.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {product.brand || "Brand"}
                        </p>
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
                      {isOut ? "Out" : `${stock} in stock`}
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
                          Edit
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/products/${product.slug}`}>View</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingId === product._id}
                      >
                        Delete
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
