import { API_URLS } from "../constants/api";
import { api } from "./api";

export const ordersApi = api.injectEndpoints({
  endpoints: build => ({
    getAllOrders: build.query({
      query: () => ({
        url: API_URLS.ORDERS,
      }),
      providesTags: ["Orders"],
    }),
    createOrder: build.mutation({
      query: orderData => ({
        url: API_URLS.ORDERS,
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const { useGetAllOrdersQuery, useCreateOrderMutation } = ordersApi;
