import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Types for different filter options
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface ExactDateFilter {
  date?: string;
}

export interface MultiSelectFilter {
  values: string[];
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Main filter interface
export interface PageFilters {
  // Pagination
  pagination: PaginationParams;

  // Date filters
  dateRange?: DateRangeFilter;
  exactDate?: ExactDateFilter;

  // Multi-select filters (dynamic based on data)
  multiSelect: Record<string, MultiSelectFilter>;

  // Search term
  search?: string;

  // Sorting
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Default values
const DEFAULT_FILTERS: PageFilters = {
  pagination: {
    page: 1,
    pageSize: 10,
  },
  multiSelect: {},
};

export const usePageParams = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [filters, setFilters] = useState<PageFilters>(DEFAULT_FILTERS);

  // Parse URL search params into filters object
  const parseSearchParams = useCallback((searchParams: URLSearchParams): PageFilters => {
    const parsed: PageFilters = {
      pagination: {
        page: parseInt(searchParams.get("page") || "1", 10),
        pageSize: parseInt(searchParams.get("pageSize") || "10", 10),
      },
      multiSelect: {},
    };

    // Parse date range
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    if (startDate || endDate) {
      parsed.dateRange = { startDate: startDate || undefined, endDate: endDate || undefined };
    }

    // Parse exact date
    const exactDate = searchParams.get("exactDate");
    if (exactDate) {
      parsed.exactDate = { date: exactDate };
    }

    // Parse search
    const search = searchParams.get("search");
    if (search) {
      parsed.search = search;
    }

    // Parse sorting
    const sortBy = searchParams.get("sortBy");
    const sortOrder = searchParams.get("sortOrder") as "asc" | "desc" | null;
    if (sortBy) {
      parsed.sortBy = sortBy;
      parsed.sortOrder = sortOrder || "asc";
    }

    // Parse multi-select filters (any param that ends with '[]')
    for (const [key] of searchParams.entries()) {
      if (key.endsWith("[]")) {
        const filterKey = key.replace("[]", "");
        if (!parsed.multiSelect[filterKey]) {
          parsed.multiSelect[filterKey] = { values: [] };
        }
        // Get all values for this multi-select filter
        const allValues = searchParams.getAll(key);
        parsed.multiSelect[filterKey].values = allValues;
      }
    }

    return parsed;
  }, []);

  // Convert filters object to URL search params
  const filtersToSearchParams = useCallback((filters: PageFilters): URLSearchParams => {
    const params = new URLSearchParams();

    // Add pagination
    if (filters.pagination.page !== 1) {
      params.set("page", filters.pagination.page.toString());
    }
    if (filters.pagination.pageSize !== 10) {
      params.set("pageSize", filters.pagination.pageSize.toString());
    }

    // Add date range
    if (filters.dateRange?.startDate) {
      params.set("startDate", filters.dateRange.startDate);
    }
    if (filters.dateRange?.endDate) {
      params.set("endDate", filters.dateRange.endDate);
    }

    // Add exact date
    if (filters.exactDate?.date) {
      params.set("exactDate", filters.exactDate.date);
    }

    // Add search
    if (filters.search) {
      params.set("search", filters.search);
    }

    // Add sorting
    if (filters.sortBy) {
      params.set("sortBy", filters.sortBy);
      params.set("sortOrder", filters.sortOrder || "asc");
    }

    // Add multi-select filters
    Object.entries(filters.multiSelect).forEach(([key, filter]) => {
      if (filter.values.length > 0) {
        filter.values.forEach(value => {
          params.append(`${key}[]`, value);
        });
      }
    });

    return params;
  }, []);

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: PageFilters) => {
      const searchParams = filtersToSearchParams(newFilters);
      const newSearch = searchParams.toString();
      const currentSearch = new URLSearchParams(location.search).toString();

      if (newSearch !== currentSearch) {
        navigate(`${location.pathname}?${newSearch}`, { replace: true });
      }
    },
    [navigate, location.pathname, filtersToSearchParams, location.search]
  );

  // Initialize filters from URL on mount and location change
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const parsedFilters = parseSearchParams(searchParams);
    setFilters(parsedFilters);
  }, [location.search, parseSearchParams]);

  // Update filters and URL
  const updateFilters = useCallback(
    (updater: Partial<PageFilters> | ((prev: PageFilters) => PageFilters)) => {
      setFilters(prev => {
        const newFilters = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
        updateURL(newFilters);
        return newFilters;
      });
    },
    [updateURL]
  );

  // Convenience methods for common operations
  const updatePagination = useCallback(
    (pagination: Partial<PaginationParams>) => {
      updateFilters(prev => ({
        ...prev,
        pagination: { ...prev.pagination, ...pagination },
      }));
    },
    [updateFilters]
  );

  const updateDateRange = useCallback(
    (dateRange: DateRangeFilter) => {
      updateFilters(prev => ({
        ...prev,
        dateRange,
        exactDate: undefined, // Clear exact date when using date range
      }));
    },
    [updateFilters]
  );

  const updateExactDate = useCallback(
    (exactDate: ExactDateFilter) => {
      updateFilters(prev => ({
        ...prev,
        exactDate,
        dateRange: undefined, // Clear date range when using exact date
      }));
    },
    [updateFilters]
  );

  const updateMultiSelect = useCallback(
    (key: string, values: string[]) => {
      updateFilters(prev => ({
        ...prev,
        multiSelect: {
          ...prev.multiSelect,
          [key]: { values },
        },
      }));
    },
    [updateFilters]
  );

  const updateSearch = useCallback(
    (search: string) => {
      updateFilters(prev => ({
        ...prev,
        search: search || undefined,
        pagination: { ...prev.pagination, page: 1 }, // Reset to first page on search
      }));
    },
    [updateFilters]
  );

  const updateSort = useCallback(
    (sortBy: string, sortOrder: "asc" | "desc" = "asc") => {
      updateFilters(prev => ({
        ...prev,
        sortBy,
        sortOrder,
      }));
    },
    [updateFilters]
  );

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    navigate(location.pathname, { replace: true });
  }, [navigate, location.pathname]);

  return {
    filters,
    updateFilters,
    updatePagination,
    updateDateRange,
    updateExactDate,
    updateMultiSelect,
    updateSearch,
    updateSort,
    clearFilters,
  };
};
