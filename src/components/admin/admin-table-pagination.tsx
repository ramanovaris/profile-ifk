import { ChevronLeft, ChevronRight } from "lucide-react";

export interface AdminTablePaginationProps {
  totalItems: number;
  startIndex: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  className?: string;
}

export function AdminTablePagination({
  totalItems,
  startIndex,
  itemsPerPage,
  currentPage,
  totalPages,
  itemLabel = "data",
  onPageChange,
  onItemsPerPageChange,
  className = "",
}: AdminTablePaginationProps) {
  if (totalItems <= 0) return null;

  return (
    <div
      className={`flex flex-col gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`.trim()}
    >
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--admin-muted)]">
        <p>
          Menampilkan{" "}
          <span className="font-medium text-[var(--admin-text-main)]">
            {startIndex + 1}–{Math.min(startIndex + itemsPerPage, totalItems)}
          </span>{" "}
          dari <span className="font-medium text-[var(--admin-text-main)]">{totalItems}</span> {itemLabel}
        </p>

        {/* Selector Baris Per Halaman */}
        <div className="flex items-center gap-1.5 border-l border-[var(--admin-border)] pl-3">
          <span className="text-[var(--admin-muted)]">Baris:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-hover-bg)] px-2 py-1 text-xs text-[var(--admin-text-main)] outline-none transition-colors hover:border-[var(--admin-border)] focus:border-brand-500/50"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-2.5 text-xs font-medium text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)] disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1 px-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                currentPage === page
                  ? "border border-brand-500/30 bg-brand-500/15 text-brand-600 dark:text-brand-300 font-semibold shadow-xs shadow-brand-500/10"
                  : "border border-transparent text-[var(--admin-muted)] hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)]"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          className="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-card-bg)] px-2.5 text-xs font-medium text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-hover-bg)] hover:text-[var(--admin-text-main)] disabled:pointer-events-none disabled:opacity-40"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
