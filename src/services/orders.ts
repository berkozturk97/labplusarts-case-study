import { api } from "./api";
import type { Order } from "../types/api";
import { API_URLS } from "../constants/api";

// Response type for dynamic columns
export interface OrdersWithColumns {
  data: Order[];
  tableColumnNames: string[];
}

export const ordersApi = api.injectEndpoints({
  endpoints: build => ({
    filterOrders: build.query<OrdersWithColumns, void>({
      query: () => ({
        url: API_URLS.ORDERS,
      }),
      transformResponse: (response: Order[]) => {
        // Extract column names from the first object if data exists
        const tableColumnNames = response.length > 0 ? Object.keys(response[0]) : [];

        return {
          data: response,
          tableColumnNames,
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
