import React from "react";
import styles from "./styles.module.css";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  disabled?: boolean;
  className?: string;
  showInfo?: boolean;
  showPageSizeSelector?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  disabled = false,
  className,
  showInfo = true,
  showPageSizeSelector = true,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex pagination with ellipsis
      if (currentPage <= 4) {
        // Show first pages + ellipsis + last
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Show first + ellipsis + last pages
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first + ellipsis + middle + ellipsis + last
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    onPageSizeChange(newPageSize);
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* Info Section */}
      {showInfo && (
        <div className={styles.info}>
          <span className={styles.infoText}>
            Showing {startItem} to {endItem} of {totalItems} results
          </span>
        </div>
      )}

      {/* Pagination Controls */}
      <div className={styles.controls}>
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={`${styles.button} ${styles.prevNext}`}
          aria-label="Previous page"
        >
          ← Previous
        </button>

        {/* Page Numbers */}
        <div className={styles.pageNumbers}>
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className={styles.ellipsis}>...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  disabled={disabled}
                  className={`${styles.button} ${styles.pageButton} ${currentPage === page ? styles.active : ""}`}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? "page" : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={`${styles.button} ${styles.prevNext}`}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>

      {/* Page Size Selector */}
      {showPageSizeSelector && (
        <div className={styles.pageSizeSelector}>
          <label className={styles.pageSizeLabel}>
            Items per page:
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              disabled={disabled}
              className={styles.pageSizeSelect}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
};

export default Pagination;
