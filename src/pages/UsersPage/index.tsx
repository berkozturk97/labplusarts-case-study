import React, { useMemo } from "react";
import styles from "./styles.module.css";
import { useFilterUsersQuery } from "../../services/users";
import DataTable from "../../components/DataTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import DateRangeFilterComponent from "../../components/DateRangeFilter";
import ExactDateFilterComponent from "../../components/ExactDateFilter";
import MultiSelectFilterComponent from "../../components/MultiSelectFilter";
import { usePageParams } from "../../hooks/usePageParams";
import type { User } from "../../types/api";

const UsersPage: React.FC = () => {
  const {
    filters,
    updateDateRange,
    updateExactDate,
    updateMultiSelect,
    updatePagination,
    updateSort,
    updateSearch,
    clearFilters,
  } = usePageParams();

  const { data: response, error, isLoading } = useFilterUsersQuery(filters);

  // Generate dynamic filter options based on canBeFilteredPropsWithDropdown
  const dynamicFilterOptions = useMemo(() => {
    if (!response?.data || response.data.length === 0) return {};

    // Get filterable fields from the first user
    const firstUser = response.data[0];
    const filterableFields = firstUser.canBeFilteredPropsWithDropdown || [];

    // Extract unique values for each filterable field
    const filterOptions: Record<string, string[]> = {};

    filterableFields.forEach(fieldName => {
      const uniqueValues = [
        ...new Set(
          response.data
            .map(user => {
              // Safe field access
              const userRecord = user as unknown as Record<string, unknown>;
              const value = userRecord[fieldName];
              // Convert boolean to string for filtering
              return typeof value === "boolean" ? String(value) : value;
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
        <LoadingSpinner size="large" text="Loading Users..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>Failed to load users data. Please try again.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  const users = response?.data || [];
  const columnNames = response?.tableColumnNames || [];

  const paginationInfo = response
    ? {
        currentPage: response.currentPage || 1,
        totalItems: response.totalItems || 0,
        pageSize: response.pageSize || 10,
        totalPages: response.totalPages || 1,
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
  const activeUsers = users.filter((user: User) => user.isActive).length;
  const inactiveUsers = users.filter((user: User) => !user.isActive).length;

  const roleCounts = users.reduce((acc: Record<string, number>, user: User) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});

  // Helper function to get display label for field names
  const getFieldDisplayLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      role: "User Role",
      isActive: "Status",
      // Add more field mappings as needed
    };
    return labels[fieldName] || fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Users Management</h1>
        <p className={styles.subtitle}>Manage and view all users in the system</p>
      </div>

      {/* Filters Section */}
      <div className={styles.filtersSection}>
        {/* Date Filters Row */}
        <div className={styles.dateFiltersRow}>
          <DateRangeFilterComponent label="Created Date Range" value={filters.dateRange} onChange={updateDateRange} />
          <ExactDateFilterComponent label="Exact Created Date" value={filters.exactDate} onChange={updateExactDate} />
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
        data={users as unknown as Record<string, unknown>[]}
        columnNames={columnNames}
        loading={isLoading}
        searchPlaceholder="Search users by name, email, role..."
        showRowNumbers={true}
        onRowClick={(user, index: number) => {
          console.log("User clicked:", user, "at index:", index);
        }}
        emptyText="No users found"
        pagination={paginationInfo}
        onPageChange={(page: number) => updatePagination({ page })}
        onPageSizeChange={(pageSize: number) => updatePagination({ page: 1, pageSize })}
        onSort={(sortBy: string, sortOrder: "asc" | "desc") => updateSort(sortBy, sortOrder)}
        onSearch={(searchTerm: string) => updateSearch(searchTerm)}
        currentSort={{
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }}
        showSearch={true}
        clientSideSearch={true}
      />

      <div className={styles.footer}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Users (All Pages):</span>
            <span className={styles.statValue}>{paginationInfo?.totalItems || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Active (Current Page):</span>
            <span className={styles.statValue}>{activeUsers}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Inactive (Current Page):</span>
            <span className={styles.statValue}>{inactiveUsers}</span>
          </div>
          {Object.entries(roleCounts).map(([role, count]) => (
            <div key={role} className={styles.statItem}>
              <span className={styles.statLabel}>{role} (Current Page):</span>
              <span className={styles.statValue}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
