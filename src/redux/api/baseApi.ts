import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";
import { API_BASE_URL, TOKEN_KEY } from "@/config";

/**
 * The single, shared RTK Query API instance.
 *
 * Feature endpoints are added elsewhere via `baseApi.injectEndpoints(...)`,
 * which keeps each domain's queries/mutations colocated with its feature while
 * still sharing one cache, one middleware, and one base URL.
 */
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Prefer the token held in the auth slice, fall back to persisted storage.
      const stateToken = (getState() as RootState).auth.token;
      const token = stateToken ?? localStorage.getItem(TOKEN_KEY);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "Profile",
    "Dashboard",
    "Applications",
    "ApplicationPeriods",
    "Donations",
    "Vendors",
    "Users",
    "Services",
    "Bookings",
    "Store",
    "Orders",
    "Membership",
    "Transactions",
    "Forum",
    "Notification",
    "Testimonials",
    "Inquiries",
    "Disclaimer",
    "Faq",
    "Coupons",
    "Refunds",
    "Events",
    "Partners",
  ],
  endpoints: () => ({}),
});

