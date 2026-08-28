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
  receiver: NotificationUserRef;
  sender?: NotificationUserRef | null;
  refId?: string;
  path?: string;
  seen: boolean;
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
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  pagination: NotificationsPagination;
  data: {
    unreadCount: number;
    data: NotificationItem[];
  };
}

export interface NotificationMutationResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, GetNotificationsParams | void>({
      query: (params) => ({
        url: "/notification",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      // Keep one cache entry so pages can merge for infinite scroll.
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, incoming) => {
        const page = incoming.pagination?.page ?? 1;
        // Page 1 always replaces (fresh load / invalidate / socket refresh).
        if (page <= 1 || !currentCache?.data?.data?.length) {
          return incoming;
        }
        const existingIds = new Set(currentCache.data.data.map((n) => n._id));
        const nextItems = incoming.data.data.filter((n) => !existingIds.has(n._id));
        currentCache.data.data.push(...nextItems);
        currentCache.data.unreadCount = incoming.data.unreadCount;
        currentCache.pagination = incoming.pagination;
        currentCache.message = incoming.message;
        currentCache.success = incoming.success;
      },
      forceRefetch({ currentArg, previousArg }) {
        return (currentArg?.page ?? 1) !== (previousArg?.page ?? 1);
      },
      providesTags: ["Notification"],
    }),

    readNotification: builder.mutation<NotificationMutationResponse, { id: string }>({
      query: ({ id }) => ({
        url: `/notification/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notification"],
    }),

    readAllNotifications: builder.mutation<NotificationMutationResponse, void>({
      query: () => ({
        url: "/notification",
        method: "PATCH",
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
} = notificationApi;

export default notificationApi;
