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

const FALLBACK_IMAGE = "/images/accessories.png";

type CategoryRow = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  isActive?: boolean;
  updatedAt?: string;
};

type CategoriesTableProps = {
  categories: CategoryRow[];
};

export default function CategoriesTable({ categories }: CategoriesTableProps) {
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
    const mapped = categories.map((category) => ({
      ...category,
      _id: normalizeId(category._id),
    }));

    if (deletedIds.length === 0) {
      return mapped;
    }

    return mapped.filter((row) => !deletedIds.includes(row._id));
  }, [categories, deletedIds]);

  const handleDelete = async (categoryId: string) => {
    if (!categoryId) return;
    if (!window.confirm("Delete this category? This cannot be undone.")) {
      return;
    }

    setDeletingId(categoryId);
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok || !data.ok) {
        toast.error(data?.error || "Unable to delete category.");
        return;
      }

      setDeletedIds((current) =>
        current.includes(categoryId) ? current : [...current, categoryId],
      );
      toast.success("Category deleted.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl border bg-white shadow-xs">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-foreground text-lg font-semibold">Categories</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage product categories and storefront visibility.
          </p>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground">
                No categories found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((category) => {
              const cover = category.image || FALLBACK_IMAGE;
              const isActive = category.isActive !== false;

              return (
                <TableRow key={category._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={cover}
                        alt={category.name}
                        className="h-12 w-12 rounded-xl object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <p className="text-foreground truncate font-medium">
                          {category.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {category.slug}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={isActive ? "secondary" : "outline"}
                      className={
                        isActive ? "bg-emerald-100 text-emerald-700" : ""
                      }
                    >
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {category.updatedAt
                      ? new Date(category.updatedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/categories/${category._id}`}>
                          Edit
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link
                          href={`/products?categories=${encodeURIComponent(
                            category.slug,
                          )}`}
                        >
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category._id)}
                        disabled={deletingId === category._id}
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
