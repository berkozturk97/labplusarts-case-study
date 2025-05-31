import { API_URLS } from "../constants/api";
import { api } from "./api";

export const usersApi = api.injectEndpoints({
  endpoints: build => ({
    getAllUsers: build.query({
      query: () => ({
        url: API_URLS.USERS,
      }),
      providesTags: ["Users"],
    }),
    createUser: build.mutation({
      query: userData => ({
        url: API_URLS.USERS,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetAllUsersQuery, useCreateUserMutation } = usersApi;
