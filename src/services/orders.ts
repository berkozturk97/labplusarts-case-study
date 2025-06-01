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

// Response type from JSON Server v1.0.0-beta.3
interface JsonServerResponse {
  first: number;
  prev: number | null;
  next: number | null;
  last: number;
  pages: number;
  items: number;
  data: Order[];
}

// Helper function to check if date string matches date range
const isDateInRange = (dateStr: string, startDate?: string, endDate?: string): boolean => {
  const date = new Date(dateStr);
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
};

// Helper function to check if date string matches exact date
const isExactDate = (dateStr: string, exactDate?: string): boolean => {
  if (!exactDate) return true;
  const date = new Date(dateStr).toISOString().split("T")[0];
  const exact = new Date(exactDate).toISOString().split("T")[0];
  return date === exact;
};

// Client-side filtering function
const filterOrdersClientSide = (orders: Order[], filters: PageFilters): Order[] => {
  return orders.filter(order => {
    // Date range filtering
    if (!isDateInRange(order.orderDate, filters.dateRange?.startDate, filters.dateRange?.endDate)) {
      return false;
    }

    // Exact date filtering
    if (!isExactDate(order.orderDate, filters.exactDate?.date)) {
      return false;
    }

    // Multi-select filtering
    for (const [key, filter] of Object.entries(filters.multiSelect)) {
      if (filter.values.length > 0) {
        const orderValue = (order as unknown as Record<string, unknown>)[key];
        if (!filter.values.includes(orderValue as string)) {
          return false;
        }
      }
    }

    // Search filtering
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        order.orderNumber,
        order.customer,
        order.status,
        order.orderDate,
        order.total.toString(),
      ];

      const matchesSearch = searchableFields.some(field => field.toLowerCase().includes(searchTerm));

      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });
};

// Client-side sorting function
const sortOrdersClientSide = (orders: Order[], sortBy?: string, sortOrder?: "asc" | "desc"): Order[] => {
  if (!sortBy) return orders;

  return [...orders].sort((a, b) => {
    const aValue = (a as unknown as Record<string, unknown>)[sortBy];
    const bValue = (b as unknown as Record<string, unknown>)[sortBy];

    let comparison = 0;

    // Handle different data types
    if (typeof aValue === "string" && typeof bValue === "string") {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === "number" && typeof bValue === "number") {
      comparison = aValue - bValue;
    } else {
      // Convert to string for comparison
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });
};

// Client-side pagination function
const paginateOrdersClientSide = (orders: Order[], page: number, pageSize: number) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = orders.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    totalItems: orders.length,
    totalPages: Math.ceil(orders.length / pageSize),
    currentPage: page,
    pageSize: pageSize,
  };
};

// Build query parameters for json-server from filters (excluding date filters)
const buildQueryParams = (): Record<string, string | number> => {
  const params: Record<string, string | number> = {};

  // Only send non-date related queries to JSON Server
  // We'll handle pagination, sorting, and filtering client-side

  // Search (json-server uses 'q' for full-text search) - disable for client-side
  // if (filters.search) {
  //   params.q = filters.search;
  // }

  // Multi-select filtering - disable for client-side
  // Object.entries(filters.multiSelect).forEach(([key, filter]) => {
  //   if (filter.values.length > 0) {
  //     if (filter.values.length === 1) {
  //       params[key] = filter.values[0];
  //     } else {
  //       const regexPattern = `^(${filter.values.join("|")})$`;
  //       params[key] = regexPattern;
  //     }
  //   }
  // });

  return params;
};

export const ordersApi = api.injectEndpoints({
  endpoints: build => ({
    filterOrders: build.query<OrdersWithColumns, PageFilters>({
      query: () => {
        const params = buildQueryParams();

        return {
          url: API_URLS.ORDERS,
          params,
        };
      },
      transformResponse: (response: JsonServerResponse | Order[], _meta: unknown, arg: PageFilters) => {
        // Handle both new pagination format and old array format
        let allOrders: Order[] = [];

        if (Array.isArray(response)) {
          // Old format - direct array
          allOrders = response;
        } else {
          // New format - structured response
          allOrders = response.data || [];
        }

        console.log("🔍 Client-side filtering started");
        console.log("📊 Total orders before filtering:", allOrders.length);
        console.log("🎯 Applied filters:", {
          dateRange: arg.dateRange,
          exactDate: arg.exactDate,
          multiSelect: arg.multiSelect,
          search: arg.search,
          sortBy: arg.sortBy,
          sortOrder: arg.sortOrder,
        });

        // Step 1: Apply client-side filtering
        const filteredOrders = filterOrdersClientSide(allOrders, arg);
        console.log("✅ Orders after filtering:", filteredOrders.length);

        // Step 2: Apply client-side sorting
        const sortedOrders = sortOrdersClientSide(filteredOrders, arg.sortBy, arg.sortOrder);

        // Step 3: Apply client-side pagination
        const paginationResult = paginateOrdersClientSide(sortedOrders, arg.pagination.page, arg.pagination.pageSize);

        console.log("📄 Final pagination result:", {
          currentPage: paginationResult.currentPage,
          pageSize: paginationResult.pageSize,
          totalItems: paginationResult.totalItems,
          totalPages: paginationResult.totalPages,
          itemsOnCurrentPage: paginationResult.data.length,
        });

        // Extract column names from the first object if data exists
        const tableColumnNames = paginationResult.data.length > 0 ? Object.keys(paginationResult.data[0]) : [];

        return {
          data: paginationResult.data,
          tableColumnNames,
          totalItems: paginationResult.totalItems,
          totalPages: paginationResult.totalPages,
          currentPage: paginationResult.currentPage,
          pageSize: paginationResult.pageSize,
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
    createOrder: build.mutation({
      query: orderData => ({
        url: "/orders",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const { useGetAllOrdersQuery, useFilterOrdersQuery, useCreateOrderMutation } = ordersApi;
