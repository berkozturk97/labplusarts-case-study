import { api } from "./api";
import type { Order } from "../types/api";
import { API_URLS } from "../constants/api";
import type { PageFilters } from "../hooks/usePageParams";

// Response type for dynamic columns with pagination info
export interface OrdersWithColumns {
  data: Order[];
  tableColumnNames: string[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Build query parameters for json-server from filters
const buildQueryParams = (filters: PageFilters): Record<string, string | number> => {
  const params: Record<string, string | number> = {};

  // Pagination - json-server uses _page and _per_page
  params._page = filters.pagination.page;
  params._per_page = filters.pagination.pageSize;

  // Sorting - json-server uses _sort with comma-separated fields, and minus (-) prefix for descending
  if (filters.sortBy) {
    const sortField = filters.sortOrder === "desc" ? `-${filters.sortBy}` : filters.sortBy;
    params._sort = sortField;
  }

  // Search - json-server uses 'q' for full-text search
  if (filters.search) {
    params.q = filters.search;
  }

  // Multi-select filtering - json-server supports exact matches and regex patterns
  Object.entries(filters.multiSelect).forEach(([key, filter]) => {
    if (filter.values.length > 0) {
      if (filter.values.length === 1) {
        // Single value - exact match
        params[key] = filter.values[0];
      } else {
        // Multiple values - use regex pattern for OR condition
        const regexPattern = `^(${filter.values.join("|")})$`;
        params[`${key}_like`] = regexPattern;
      }
    }
  });

  // Date filtering - we'll handle this with custom logic since json-server doesn't have built-in date range support
  // For now, we'll use greater than/less than operations for date ranges
  if (filters.dateRange?.startDate) {
    params.orderDate_gte = filters.dateRange.startDate;
  }
  if (filters.dateRange?.endDate) {
    params.orderDate_lte = filters.dateRange.endDate;
  }
  if (filters.exactDate?.date) {
    params.orderDate = filters.exactDate.date;
  }

  return params;
};

export const ordersApi = api.injectEndpoints({
  endpoints: build => ({
    filterOrders: build.query<OrdersWithColumns, PageFilters>({
      query: filters => {
        const params = buildQueryParams(filters);

        return {
          url: API_URLS.ORDERS,
          params,
        };
      },
      transformResponse: (
        response: Order[] | { data: Order[]; items?: number } | unknown,
        meta: { response?: { headers?: { get?: (key: string) => string | null } } } | undefined,
        arg: PageFilters
      ) => {
        // json-server returns data directly for paginated results
        // The pagination info is in the response headers or meta
        let orders: Order[] = [];
        let totalItems = 0;

        if (Array.isArray(response)) {
          orders = response;
          // If we get an array, it means all data - calculate total from length
          totalItems = response.length;
        } else if (response && typeof response === "object" && "data" in response) {
          const typedResponse = response as { data: Order[]; items?: number };
          orders = typedResponse.data;
          totalItems = typedResponse.items || typedResponse.data.length;
        } else {
          orders = (response as Order[]) || [];
          totalItems = orders.length;
        }

        // Extract pagination info from headers if available
        const totalItemsFromHeader = meta?.response?.headers?.get?.("x-total-count");
        if (totalItemsFromHeader) {
          totalItems = parseInt(totalItemsFromHeader, 10);
        }

        const currentPage = arg.pagination.page;
        const pageSize = arg.pagination.pageSize;
        const totalPages = Math.ceil(totalItems / pageSize);

        // Extract column names from the first object if data exists
        // Exclude internal fields that shouldn't be displayed in table
        const excludedFields = ["canBeFilteredPropsWithDropdown"];
        const tableColumnNames =
          orders.length > 0 ? Object.keys(orders[0]).filter(key => !excludedFields.includes(key)) : [];

        return {
          data: orders,
          tableColumnNames,
          totalItems,
          totalPages,
          currentPage,
          pageSize,
        };
      },
      providesTags: ["Orders"],
    }),
    getAllOrders: build.query({
      query: () => ({
        url: API_URLS.ORDERS,
      }),
      providesTags: ["Orders"],
    }),
    createOrder: build.mutation<Order, Omit<Order, "id">>({
      query: orderData => ({
        url: API_URLS.ORDERS,
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const { useGetAllOrdersQuery, useFilterOrdersQuery, useCreateOrderMutation } = ordersApi;
