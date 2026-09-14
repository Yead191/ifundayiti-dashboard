import { baseApi } from "@/redux/api/baseApi";

export interface NotificationUserRef {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message?: string;
  receiver: NotificationUserRef | string;
  sender?: NotificationUserRef | null;
  refId?: string;
  path?: string;
  seen: boolean;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsPagination {
  total: number;
  limit: number;
  page: number;
  totalPage: number;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  seen?: boolean;
  sort?: string;
}

export interface NotificationsResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  pagination: NotificationsPagination;
  data: {
    unreadCount: number;
    data: NotificationItem[];
  };
}

export interface NotificationMutationResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  data?: unknown;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, GetNotificationsParams | void>({
      query: (params) => {
        const queryParams: Record<string, any> = {
          page: 1,
          limit: 10,
          sort: "-createdAt",
        };

        if (params) {
          if (params.page !== undefined) queryParams.page = params.page;
          if (params.limit !== undefined) queryParams.limit = params.limit;
          if (params.sort !== undefined) queryParams.sort = params.sort;
          if (params.searchTerm !== undefined && params.searchTerm.trim()) {
            queryParams.searchTerm = params.searchTerm.trim();
          }
          if (params.seen !== undefined) {
            queryParams.seen = params.seen;
          }
        }

        return {
          url: "/notification",
          method: "GET",
          params: queryParams,
        };
      },
      providesTags: ["Notification"],
    }),

    readNotification: builder.mutation<NotificationMutationResponse, { id: string } | string>({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        return {
          url: `/notification/${id}`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["Notification"],
    }),

    readAllNotifications: builder.mutation<NotificationMutationResponse, void>({
      query: () => ({
        url: "/notification",
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    deleteNotification: builder.mutation<NotificationMutationResponse, { id: string } | string>({
      query: (arg) => {
        const id = typeof arg === "string" ? arg : arg.id;
        return {
          url: `/notification/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Notification"],
    }),

    clearAllNotifications: builder.mutation<NotificationMutationResponse, void>({
      query: () => ({
        url: "/notification/clear-all",
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useReadNotificationMutation,
  useReadAllNotificationsMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} = notificationApi;

export default notificationApi;
