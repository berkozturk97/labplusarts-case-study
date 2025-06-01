import React from "react";
import styles from "./styles.module.css";
import { useFilterOrdersQuery } from "../../services/orders";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import DateRangeFilterComponent from "../../components/DateRangeFilter";
import ExactDateFilterComponent from "../../components/ExactDateFilter";
import MultiSelectFilterComponent from "../../components/MultiSelectFilter";
import { usePageParams } from "../../hooks/usePageParams";
import type { Order } from "../../types/api";

const OrdersPage: React.FC = () => {
  const { filters, updateDateRange, updateExactDate, updateMultiSelect, updatePagination, updateSort, clearFilters } =
    usePageParams();

  const { data: response, error, isLoading } = useFilterOrdersQuery(filters);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <LoadingSpinner size="large" text="Loading Orders..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>Failed to load orders data. Please try again.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const orders = response?.data || [];
  const columnNames = response?.tableColumnNames || [];
  const paginationInfo = response
    ? {
        currentPage: response.currentPage,
        totalItems: response.totalItems,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
        navigation:
          response.data && response.totalPages
            ? {
                first: 1,
                prev: response.currentPage > 1 ? response.currentPage - 1 : null,
                next: response.currentPage < response.totalPages ? response.currentPage + 1 : null,
                last: response.totalPages,
              }
            : undefined,
      }
    : undefined;

  // Extract unique values for multi-select filters from all data (not just current page)
  // Note: In real implementation, you might want to fetch these separately
  const statusOptions = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  const customerOptions = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown", "Charlie Wilson", "Diana Clark"];

  // Calculate statistics from current page data
  const totalRevenue = orders
    .filter((order: Order) => order.status !== "Cancelled")
    .reduce((sum: number, order: Order) => sum + order.total, 0);

  const statusCounts = orders.reduce((acc: Record<string, number>, order: Order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orders Management</h1>
        <p className={styles.subtitle}>Track and manage all customer orders</p>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersGrid}>
          <DateRangeFilterComponent label="Order Date Range" value={filters.dateRange} onChange={updateDateRange} />

          <ExactDateFilterComponent label="Exact Order Date" value={filters.exactDate} onChange={updateExactDate} />

          <MultiSelectFilterComponent
            label="Order Status"
            options={statusOptions}
            value={filters.multiSelect.status}
            onChange={values => updateMultiSelect("status", values)}
            placeholder="Search status..."
          />

          <MultiSelectFilterComponent
            label="Customer"
            options={customerOptions}
            value={filters.multiSelect.customer}
            onChange={values => updateMultiSelect("customer", values)}
            placeholder="Search customers..."
            maxHeight="300px"
          />
        </div>

        <div className={styles.filtersActions}>
          <button onClick={clearFilters} className={styles.clearFiltersButton}>
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Debug info */}
      <div className={styles.debugInfo}>
        <details>
          <summary>Debug: Current Filters, Pagination & Sorting</summary>
          <div>
            <h4>Filters:</h4>
            <pre>{JSON.stringify(filters, null, 2)}</pre>
          </div>
          {paginationInfo && (
            <div>
              <h4>Pagination Info:</h4>
              <pre>{JSON.stringify(paginationInfo, null, 2)}</pre>
            </div>
          )}
          {response && (
            <div>
              <h4>JSON Server Response Meta:</h4>
              <pre>
                {JSON.stringify(
                  {
                    totalItems: response.totalItems,
                    totalPages: response.totalPages,
                    currentPage: response.currentPage,
                    pageSize: response.pageSize,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
          {(filters.sortBy || filters.sortOrder) && (
            <div>
              <h4>Current Sort:</h4>
              <pre>{JSON.stringify({ sortBy: filters.sortBy, sortOrder: filters.sortOrder }, null, 2)}</pre>
            </div>
          )}
        </details>
      </div>

      <DataTable
        data={orders as unknown as Record<string, unknown>[]}
        columnNames={columnNames}
        loading={isLoading}
        searchPlaceholder="Search orders by number, customer, status..."
        showRowNumbers={true}
        onRowClick={(order, index: number) => {
          console.log("Order clicked:", order, "at index:", index);
        }}
        emptyText="No orders found"
        pagination={paginationInfo}
        onPageChange={(page: number) => updatePagination({ page })}
        onPageSizeChange={(pageSize: number) => updatePagination({ page: 1, pageSize })}
        onSort={(sortBy: string, sortOrder: "asc" | "desc") => updateSort(sortBy, sortOrder)}
        currentSort={{
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }}
        showSearch={true} // Enable table search
        clientSideSearch={true} // Search works on current data (client-side)
        clientSideSorting={false} // Sorting uses server-side logic via usePageParams
      />

      <div className={styles.footer}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Orders (All Pages):</span>
            <span className={styles.statValue}>{paginationInfo?.totalItems || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Current Page Revenue:</span>
            <span className={styles.statValue}>${totalRevenue.toFixed(2)}</span>
          </div>
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className={styles.statItem}>
              <span className={styles.statLabel}>{status} (Current Page):</span>
              <span className={styles.statValue}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
