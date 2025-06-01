import React, { useState, useMemo, useEffect, useRef } from "react";
import styles from "./styles.module.css";
import Pagination from "../Pagination";

// Generic column configuration interface
export interface TableColumn<T = Record<string, unknown>> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: T[keyof T], record: T, index: number) => React.ReactNode;
  searchable?: boolean;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

// Pagination info interface
export interface PaginationInfo {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  totalPages: number;
  // JSON Server navigation info
  navigation?: {
    first: number;
    prev: number | null;
    next: number | null;
    last: number;
  };
}

// Generic table props interface
export interface DataTableProps<T = Record<string, unknown>> {
  data: T[];
  columns?: TableColumn<T>[];
  columnNames?: string[];
  loading?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  showSearch?: boolean;
  showRowNumbers?: boolean;
  onRowClick?: (record: T, index: number) => void;
  className?: string;

  // Pagination props
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPagination?: boolean;

  // Granular control for client-side vs server-side operations
  clientSideSearch?: boolean;

  // Sorting props
  onSort?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  currentSort?: {
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  };

  // Search props
  onSearch?: (searchTerm: string) => void;
}

// Helper function to generate columns from property names
const generateColumnsFromNames = <T,>(columnNames: string[]): TableColumn<T>[] => {
  return columnNames.map(name => ({
    key: name,
    title: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1"),
    dataIndex: name as keyof T,
    sortable: true,
    searchable: true,
    render: (value: T[keyof T]) => {
      // Handle different data types
      if (typeof value === "boolean") {
        return (
          <span
            style={{
              backgroundColor: value ? "#dcfce7" : "#fee2e2",
              color: value ? "#166534" : "#991b1b",
              padding: "0.25rem 0.5rem",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontWeight: "500",
            }}
          >
            {value ? "Yes" : "No"}
          </span>
        );
      }

      // Handle dates
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
        const date = new Date(value);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }

      // Handle numbers that look like currency
      if (typeof value === "number" && name.toLowerCase().includes("total")) {
        return `$${value.toFixed(2)}`;
      }

      return String(value ?? "");
    },
  }));
};

const DataTable = <T extends Record<string, unknown>>({
  data,
  columns,
  columnNames,
  loading = false,
  searchPlaceholder = "Search...",
  emptyText = "No data available",
  showSearch = true,
  showRowNumbers = false,
  onRowClick,
  className,
  pagination,
  onPageChange,
  onPageSizeChange,
  showPagination = true,
  clientSideSearch,
  onSort,
  currentSort,
  onSearch,
}: DataTableProps<T>): React.ReactElement => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

  // Use ref to track the last search term that was sent to the server
  const lastSearchTermRef = useRef<string>("");

  // Debounce search for server-side search - only when search term actually changes
  useEffect(() => {
    if (onSearch && pagination && !clientSideSearch && searchTerm !== lastSearchTermRef.current) {
      const timeoutId = setTimeout(() => {
        onSearch(searchTerm);
        lastSearchTermRef.current = searchTerm;
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, onSearch, pagination, clientSideSearch]);

  // Handle search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  // Generate columns from either predefined columns or column names
  const tableColumns = useMemo(() => {
    if (columns) {
      return columns;
    }
    if (columnNames) {
      return generateColumnsFromNames<T>(columnNames);
    }
    return [];
  }, [columns, columnNames]);

  // Filter data based on search term (only for client-side search when no pagination)
  const filteredData = useMemo(() => {
    // If pagination is provided and it's server-side, don't filter client-side
    if (pagination && !clientSideSearch) return data;

    if (!searchTerm.trim()) return data;

    const searchLower = searchTerm.toLowerCase();
    return data.filter(item => {
      return tableColumns
        .filter(col => col.searchable !== false)
        .some(col => {
          const value = item[col.dataIndex];
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchLower);
        });
    });
  }, [data, searchTerm, tableColumns, pagination, clientSideSearch]);

  // Sort filtered data (only for client-side sorting when no pagination)
  const sortedData = useMemo(() => {
    // If pagination is provided and it's server-side, don't sort client-side
    if (pagination) return filteredData;

    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortConfig.direction === "desc" ? comparison * -1 : comparison;
    });
  }, [filteredData, sortConfig, pagination]);

  // Handle column sorting
  const handleSort = (columnKey: keyof T) => {
    const column = tableColumns.find(col => col.dataIndex === columnKey);
    if (!column?.sortable) return;

    // If pagination is provided and it's server-side, use server-side sorting
    if (pagination && onSort) {
      const newDirection =
        currentSort?.sortBy === String(columnKey) && currentSort?.sortOrder === "asc" ? "desc" : "asc";
      onSort(String(columnKey), newDirection);
    } else {
      // Use client-side sorting
      setSortConfig(prevSort => ({
        key: columnKey,
        direction: prevSort.key === columnKey && prevSort.direction === "asc" ? "desc" : "asc",
      }));
    }
  };

  // Get sort icon for column
  const getSortIcon = (columnKey: keyof T) => {
    // If using server-side sorting, use currentSort
    if (pagination && currentSort) {
      if (currentSort.sortBy !== String(columnKey)) return "↕️";
      return currentSort.sortOrder === "asc" ? "↑" : "↓";
    }

    // Otherwise use local sortConfig
    if (sortConfig.key !== columnKey) return "↕️";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // Handle row click
  const handleRowClick = (record: T, index: number) => {
    if (onRowClick) {
      onRowClick(record, index);
    }
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${className || ""}`}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  const displayData = sortedData;

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* Search Bar */}
      {showSearch && (
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => handleSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      )}

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        {pagination ? (
          <>
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems}{" "}
            results
          </>
        ) : (
          <>
            Showing {displayData.length} of {data.length} results
            {searchTerm && (
              <span className={styles.searchInfo}>
                {" "}
                for "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className={styles.clearSearch}>
                  ✕
                </button>
              </span>
            )}
          </>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {showRowNumbers && (
                <th className={styles.th} style={{ width: "60px" }}>
                  #
                </th>
              )}
              {tableColumns.map(column => (
                <th
                  key={column.key}
                  className={`${styles.th} ${column.sortable ? styles.sortable : ""}`}
                  style={{
                    width: column.width,
                    textAlign: column.align || "left",
                  }}
                  onClick={() => column.sortable && handleSort(column.dataIndex)}
                >
                  <div className={styles.thContent}>
                    <span>{column.title}</span>
                    {column.sortable && <span className={styles.sortIcon}>{getSortIcon(column.dataIndex)}</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {displayData.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length + (showRowNumbers ? 1 : 0)} className={styles.emptyCell}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              displayData.map((record, index) => {
                const actualIndex = pagination
                  ? (pagination.currentPage - 1) * pagination.pageSize + index + 1
                  : index + 1;

                return (
                  <tr
                    key={index}
                    className={`${styles.tr} ${onRowClick ? styles.clickable : ""}`}
                    onClick={() => handleRowClick(record, index)}
                  >
                    {showRowNumbers && <td className={styles.td}>{actualIndex}</td>}
                    {tableColumns.map(column => (
                      <td key={column.key} className={styles.td} style={{ textAlign: column.align || "left" }}>
                        {column.render
                          ? column.render(record[column.dataIndex], record, index)
                          : String(record[column.dataIndex] ?? "")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && pagination && onPageChange && onPageSizeChange && (
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          disabled={loading}
        />
      )}
    </div>
  );
};

export default DataTable;
