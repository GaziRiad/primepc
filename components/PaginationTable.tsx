import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationQuery = { [key: string]: string | string[] | undefined };

type PaginationTableProps = {
  page: number;
  totalPages: number;
  query: PaginationQuery;
  basePath?: string;
};

const getPageItems = (page: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, idx) => idx + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
};

const buildHref = (basePath: string, query: PaginationQuery, page: number) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (!value || key === "page") return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }
    params.set(key, value);
  });

  if (page > 1) {
    params.set("page", String(page));
  }

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
};

export default function PaginationTable({
  page,
  totalPages,
  query,
  basePath = "/products",
}: PaginationTableProps) {
  if (totalPages <= 1) return null;

  const pageItems = getPageItems(page, totalPages);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hasPrevious ? buildHref(basePath, query, page - 1) : "#"}
            aria-disabled={!hasPrevious}
            tabIndex={hasPrevious ? undefined : -1}
            className={
              !hasPrevious ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={buildHref(basePath, query, item)}
                isActive={item === page}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={hasNext ? buildHref(basePath, query, page + 1) : "#"}
            aria-disabled={!hasNext}
            tabIndex={hasNext ? undefined : -1}
            className={!hasNext ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
