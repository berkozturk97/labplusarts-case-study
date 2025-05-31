import { API_URLS } from "../constants/api";
import type { User } from "../types/api";
import { api } from "./api";

// Response type for dynamic columns
export interface UsersWithColumns {
  data: User[];
  tableColumnNames: string[];
}

export const usersApi = api.injectEndpoints({
  endpoints: build => ({
    filterUsers: build.query<UsersWithColumns, void>({
      query: () => ({
        url: API_URLS.USERS,
      }),
      transformResponse: (response: User[]) => {
        // Extract column names from the first object if data exists
        const tableColumnNames = response.length > 0 ? Object.keys(response[0]) : [];

        return {
          data: response,
          tableColumnNames,
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
        url: API_URLS.USERS,
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetAllUsersQuery, useFilterUsersQuery, useCreateUserMutation } = usersApi;
