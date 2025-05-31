import React, { useState, useMemo } from "react";
import styles from "./styles.module.css";

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
}: DataTableProps<T>): React.ReactElement => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });

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

  // Filter data based on search term
  const filteredData = useMemo(() => {
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
  }, [data, searchTerm, tableColumns]);

  // Sort filtered data
  const sortedData = useMemo(() => {
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
  }, [filteredData, sortConfig]);

  // Handle column sorting
  const handleSort = (columnKey: keyof T) => {
    const column = tableColumns.find(col => col.dataIndex === columnKey);
    if (!column?.sortable) return;

    setSortConfig(prevSort => ({
      key: columnKey,
      direction: prevSort.key === columnKey && prevSort.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Get sort icon for column
  const getSortIcon = (columnKey: keyof T) => {
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

  return (
    <div className={`${styles.container} ${className || ""}`}>
      {/* Search Bar */}
      {showSearch && (
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>
      )}

      {/* Results Info */}
      <div className={styles.resultsInfo}>
        Showing {sortedData.length} of {data.length} results
        {searchTerm && (
          <span className={styles.searchInfo}>
            {" "}
            for "{searchTerm}"
            <button onClick={() => setSearchTerm("")} className={styles.clearSearch}>
              ✕
            </button>
          </span>
        )}
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              {showRowNumbers && <th className={styles.rowNumberHeader}>#</th>}
              {tableColumns.map(column => (
                <th
                  key={column.key}
                  className={`${styles.tableHeader} ${
                    column.sortable ? styles.sortable : ""
                  } ${styles[`align${column.align || "left"}`]}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.dataIndex)}
                >
                  <div className={styles.headerContent}>
                    <span>{column.title}</span>
                    {column.sortable && <span className={styles.sortIcon}>{getSortIcon(column.dataIndex)}</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length + (showRowNumbers ? 1 : 0)} className={styles.emptyCell}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => (
                <tr
                  key={index}
                  className={`${styles.tableRow} ${onRowClick ? styles.clickable : ""}`}
                  onClick={() => handleRowClick(record, index)}
                >
                  {showRowNumbers && <td className={styles.rowNumberCell}>{index + 1}</td>}
                  {tableColumns.map(column => {
                    const value = record[column.dataIndex];
                    const displayValue = column.render ? column.render(value, record, index) : String(value ?? "");

                    return (
                      <td
                        key={column.key}
                        className={`${styles.tableCell} ${styles[`align${column.align || "left"}`]}`}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
