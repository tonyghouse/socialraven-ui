"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  appearance?: "default" | "geist";
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 7,
  appearance = "default",
}: PaginationProps) {
  const isGeist = appearance === "geist";
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      const leftSiblingIndex = Math.max(currentPage - 1, 2);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages - 1);

      const showLeftEllipsis = leftSiblingIndex > 2;
      const showRightEllipsis = rightSiblingIndex < totalPages - 1;

      if (!showLeftEllipsis && showRightEllipsis) {
        // Near the start
        for (let i = 2; i <= Math.min(maxVisiblePages - 2, totalPages - 1); i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      } else if (showLeftEllipsis && !showRightEllipsis) {
        // Near the end
        pages.push("ellipsis");
        for (let i = Math.max(totalPages - maxVisiblePages + 3, 2); i <= totalPages - 1; i++) {
          pages.push(i);
        }
      } else if (showLeftEllipsis && showRightEllipsis) {
        // In the middle
        pages.push("ellipsis");
        for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
      } else {
        // Show all middle pages
        for (let i = 2; i <= totalPages - 1; i++) {
          pages.push(i);
        }
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn(
        "flex items-center justify-center gap-2",
        isGeist && "text-[var(--ds-gray-1000)]"
      )}
    >
      {/* First Page Button */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="Go to first page"
        className={cn(
          "h-9 w-9 rounded-lg border",
          "flex items-center justify-center transition-all",
          isGeist
            ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--ds-gray-400)] disabled:hover:bg-[var(--ds-background-100)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]"
            : "border-border bg-card hover:bg-muted hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        )}
      >
        <ChevronsLeft
          className={cn(
            "h-4 w-4",
            isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground"
          )}
        />
      </button>

      {/* Previous Page Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className={cn(
          "h-9 w-9 rounded-lg border",
          "flex items-center justify-center transition-all",
          isGeist
            ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--ds-gray-400)] disabled:hover:bg-[var(--ds-background-100)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]"
            : "border-border bg-card hover:bg-muted hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        )}
      >
        <ChevronLeft
          className={cn(
            "h-4 w-4",
            isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground"
          )}
        />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis") {
            return (
              <span
                key={`ellipsis-${index}`}
                className={cn(
                  "h-9 w-9 flex items-center justify-center",
                  isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground"
                )}
                aria-hidden="true"
              >
                •••
              </span>
            );
          }

          const isActive = page === currentPage;

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "h-9 min-w-[2.25rem] px-3 rounded-lg border transition-all",
                "flex items-center justify-center font-medium text-sm",
                isGeist
                  ? "focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]"
                  : "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                isActive
                  ? isGeist
                    ? "border-[var(--ds-blue-600)] bg-[var(--ds-blue-600)] text-white shadow-none"
                    : "bg-primary text-primary-foreground border-primary shadow-sm"
                  : isGeist
                    ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)]"
                    : "bg-card border-border text-foreground hover:bg-muted hover:border-primary/30"
              )}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Page Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className={cn(
          "h-9 w-9 rounded-lg border",
          "flex items-center justify-center transition-all",
          isGeist
            ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--ds-gray-400)] disabled:hover:bg-[var(--ds-background-100)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]"
            : "border-border bg-card hover:bg-muted hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        )}
      >
        <ChevronRight
          className={cn(
            "h-4 w-4",
            isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground"
          )}
        />
      </button>

      {/* Last Page Button */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Go to last page"
        className={cn(
          "h-9 w-9 rounded-lg border",
          "flex items-center justify-center transition-all",
          isGeist
            ? "border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] hover:border-[var(--ds-gray-500)] hover:bg-[var(--ds-gray-100)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-[var(--ds-gray-400)] disabled:hover:bg-[var(--ds-background-100)] focus:outline-none focus:ring-2 focus:ring-[var(--ds-blue-600)] focus:ring-offset-2 focus:ring-offset-[var(--ds-background-100)]"
            : "border-border bg-card hover:bg-muted hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card disabled:hover:border-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        )}
      >
        <ChevronsRight
          className={cn(
            "h-4 w-4",
            isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground"
          )}
        />
      </button>

      {/* Page Info */}
      <div
        className={cn(
          "ml-4 hidden text-sm sm:block",
          isGeist ? "text-[var(--ds-gray-900)]" : "text-muted-foreground"
        )}
      >
        Page{" "}
        <span
          className={cn(
            "font-medium",
            isGeist ? "text-[var(--ds-gray-1000)]" : "text-foreground"
          )}
        >
          {currentPage}
        </span>{" "}
        of{" "}
        <span
          className={cn(
            "font-medium",
            isGeist ? "text-[var(--ds-gray-1000)]" : "text-foreground"
          )}
        >
          {totalPages}
        </span>
      </div>
    </nav>
  );
}
