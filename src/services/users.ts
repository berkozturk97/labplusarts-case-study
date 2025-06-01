import { api } from "./api";
import type { User } from "../types/api";
import { API_URLS } from "../constants/api";
import type { PageFilters } from "../hooks/usePageParams";

// Response type for dynamic columns with pagination info
export interface UsersWithColumns {
  data: User[];
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
  // For users, we'll filter by createdAt field
  if (filters.dateRange?.startDate) {
    params.createdAt_gte = filters.dateRange.startDate;
  }
  if (filters.dateRange?.endDate) {
    params.createdAt_lte = filters.dateRange.endDate;
  }
  if (filters.exactDate?.date) {
    params.createdAt = filters.exactDate.date;
  }

  return params;
};

export const usersApi = api.injectEndpoints({
  endpoints: build => ({
    filterUsers: build.query<UsersWithColumns, PageFilters>({
      query: filters => {
        const params = buildQueryParams(filters);

        return {
          url: API_URLS.USERS,
          params,
        };
      },
      transformResponse: (
        response: User[] | { data: User[]; items?: number } | unknown,
        meta: { response?: { headers?: { get?: (key: string) => string | null } } } | undefined,
        arg: PageFilters
      ) => {
        // json-server returns data directly for paginated results
        // The pagination info is in the response headers or meta
        let users: User[] = [];
        let totalItems = 0;

        if (Array.isArray(response)) {
          users = response;
          // If we get an array, it means all data - calculate total from length
          totalItems = response.length;
        } else if (response && typeof response === "object" && "data" in response) {
          const typedResponse = response as { data: User[]; items?: number };
          users = typedResponse.data;
          totalItems = typedResponse.items || typedResponse.data.length;
        } else {
          users = (response as User[]) || [];
          totalItems = users.length;
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
          users.length > 0 ? Object.keys(users[0]).filter(key => !excludedFields.includes(key)) : [];

        return {
          data: users,
          tableColumnNames,
          totalItems,
          totalPages,
          currentPage,
          pageSize,
        };
      },
      providesTags: ["Users"],
    }),
    getAllUsers: build.query({
      query: () => ({
        url: API_URLS.USERS,
      }),
      providesTags: ["Users"],
    }),
    createUser: build.mutation({
      query: userData => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetAllUsersQuery, useFilterUsersQuery, useCreateUserMutation } = usersApi;
