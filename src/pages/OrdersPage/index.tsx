import React, { useMemo } from "react";
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

  // Generate dynamic filter options based on canBeFilteredPropsWithDropdown
  const dynamicFilterOptions = useMemo(() => {
    if (!response?.data || response.data.length === 0) return {};

    // Get filterable fields from the first order
    const firstOrder = response.data[0];
    const filterableFields = firstOrder.canBeFilteredPropsWithDropdown || [];

    // Extract unique values for each filterable field
    const filterOptions: Record<string, string[]> = {};

    filterableFields.forEach(fieldName => {
      const uniqueValues = [
        ...new Set(
          response.data
            .map(order => {
              // Safe field access
              const orderRecord = order as unknown as Record<string, unknown>;
              return orderRecord[fieldName];
            })
            .filter(value => value != null && value !== "")
            .map(value => String(value)) // Convert to string for consistent typing
        ),
      ].sort();

      filterOptions[fieldName] = uniqueValues;
    });

    return filterOptions;
  }, [response?.data]);

  // Get filterable fields list
  const filterableFields = useMemo(() => {
    if (!response?.data || response.data.length === 0) return [];
    return response.data[0].canBeFilteredPropsWithDropdown || [];
  }, [response?.data]);

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

  // Calculate statistics from current page data
  const totalRevenue = orders
    .filter((order: Order) => order.status !== "Cancelled")
    .reduce((sum: number, order: Order) => sum + order.total, 0);

  const statusCounts = orders.reduce((acc: Record<string, number>, order: Order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // Helper function to get display label for field names
  const getFieldDisplayLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      customer: "Customer",
      status: "Order Status",
      // Add more field mappings as needed
    };
    return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Orders Management</h1>
        <p className={styles.subtitle}>Track and manage all customer orders</p>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        {/* Date Filters Row */}
        <div className={styles.dateFiltersRow}>
          <DateRangeFilterComponent label="Order Date Range" value={filters.dateRange} onChange={updateDateRange} />
          <ExactDateFilterComponent label="Exact Order Date" value={filters.exactDate} onChange={updateExactDate} />
        </div>

        {/* Dropdown Filters Column */}
        <div className={styles.dropdownFiltersColumn}>
          {/* Dynamic MultiSelect Filters */}
          {filterableFields.map(fieldName => (
            <MultiSelectFilterComponent
              key={fieldName}
              label={getFieldDisplayLabel(fieldName)}
              options={dynamicFilterOptions[fieldName] || []}
              value={filters.multiSelect[fieldName]}
              onChange={values => updateMultiSelect(fieldName, values)}
              placeholder={`Search ${getFieldDisplayLabel(fieldName).toLowerCase()}...`}
              maxHeight="350px"
            />
          ))}
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
            <h4>Dynamic Filter Options:</h4>
            <pre>{JSON.stringify(dynamicFilterOptions, null, 2)}</pre>
          </div>
          <div>
            <h4>Filterable Fields:</h4>
            <pre>{JSON.stringify(filterableFields, null, 2)}</pre>
          </div>
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
