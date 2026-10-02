import { baseApi } from "../../api/baseApi";
import type {
  GetExpensesParams,
  ExpensesListResponse,
  SingleExpenseResponse,
  ExpenseStatsResponse,
  CreateExpensePayload,
  UpdateExpensePayload,
  UpdateExpenseStatusPayload,
} from "./expenses.types";

export const expensesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseStats: builder.query<ExpenseStatsResponse, void>({
      query: () => ({
        url: "/expense/stats",
        method: "GET",
      }),
      providesTags: [{ type: "Expenses", id: "STATS" }],
    }),

    getExpenses: builder.query<ExpensesListResponse, GetExpensesParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append("page", String(params.page));
          if (params.limit) queryParams.append("limit", String(params.limit));
          if (params.searchTerm && params.searchTerm.trim()) {
            queryParams.append("searchTerm", params.searchTerm.trim());
          }
          if (params.category && params.category !== "all") {
            queryParams.append("category", params.category);
          }
          if (params.subcategory && params.subcategory !== "all") {
            queryParams.append("subcategory", params.subcategory);
          }
          if (params.payment_status && params.payment_status !== "all") {
            queryParams.append("payment_status", params.payment_status);
          }
          if (params.payment_method && params.payment_method !== "all") {
            queryParams.append("payment_method", params.payment_method);
          }
          if (params.startDate) {
            queryParams.append("startDate", params.startDate);
          }
          if (params.endDate) {
            queryParams.append("endDate", params.endDate);
          }
          if (params.sort) {
            queryParams.append("sort", params.sort);
          }
        }
        const qs = queryParams.toString();
        return {
          url: `/expense${qs ? `?${qs}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Expenses" as const,
                id: _id,
              })),
              { type: "Expenses", id: "LIST" },
            ]
          : [{ type: "Expenses", id: "LIST" }],
    }),

    getExpenseById: builder.query<SingleExpenseResponse, string>({
      query: (id) => ({
        url: `/expense/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Expenses", id }],
    }),

    createExpense: builder.mutation<SingleExpenseResponse, CreateExpensePayload>({
      query: (body) => ({
        url: "/expense",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "Expenses", id: "LIST" },
        { type: "Expenses", id: "STATS" },
        { type: "Donations", id: "STATS" },
        "Transactions",
      ],
    }),

    updateExpense: builder.mutation<
      SingleExpenseResponse,
      { id: string; body: UpdateExpensePayload }
    >({
      query: ({ id, body }) => ({
        url: `/expense/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Expenses", id },
        { type: "Expenses", id: "LIST" },
        { type: "Expenses", id: "STATS" },
        { type: "Donations", id: "STATS" },
        "Transactions",
      ],
    }),

    updateExpenseStatus: builder.mutation<
      SingleExpenseResponse,
      { id: string; body: UpdateExpenseStatusPayload }
    >({
      query: ({ id, body }) => ({
        url: `/expense/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Expenses", id },
        { type: "Expenses", id: "LIST" },
        { type: "Expenses", id: "STATS" },
        { type: "Donations", id: "STATS" },
        "Transactions",
      ],
    }),

    deleteExpense: builder.mutation<{ success: boolean; message: string; data?: any }, string>({
      query: (id) => ({
        url: `/expense/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Expenses", id: "LIST" },
        { type: "Expenses", id: "STATS" },
        { type: "Donations", id: "STATS" },
        "Transactions",
      ],
    }),

    deleteMultipleExpenses: builder.mutation<
      { success: boolean; message: string; data?: { deletedCount: number } },
      { ids: string[] }
    >({
      query: (body) => ({
        url: "/expense/delete-multiple",
        method: "DELETE",
        body,
      }),
      invalidatesTags: [
        { type: "Expenses", id: "LIST" },
        { type: "Expenses", id: "STATS" },
        { type: "Donations", id: "STATS" },
        "Transactions",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExpenseStatsQuery,
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useUpdateExpenseStatusMutation,
  useDeleteExpenseMutation,
  useDeleteMultipleExpensesMutation,
} = expensesApi;
