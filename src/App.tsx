import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageLoader } from "@/components/ui/PageLoader";
import OrdersPage from "./features/orders/OrdersPage";

// Route-level code splitting keeps the initial bundle lean — each page's
// chunk is only fetched when the admin actually navigates there.
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const ForgotPasswordPage = lazy(
  () => import("@/features/auth/ForgotPasswordPage"),
);
const VerifyOtpPage = lazy(() => import("@/features/auth/VerifyOtpPage"));
const ResetPasswordPage = lazy(
  () => import("@/features/auth/ResetPasswordPage"),
);
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage"));
const StorePage = lazy(() => import("@/features/store/StorePage"));
const CouponsPage = lazy(() => import("@/features/coupons/CouponsPage"));
const RefundsPage = lazy(() => import("@/features/refunds/RefundsPage"));
const RefundDetailPage = lazy(
  () => import("@/features/refunds/RefundDetailPage"),
);
const EventsPage = lazy(() => import("@/features/events/EventsPage"));
const EventDetailPage = lazy(() => import("@/features/events/EventDetailPage"));
const IFundAyitiOverviewPage = lazy(
  () => import("@/features/ifundayiti/IFundAyitiOverviewPage"),
);
const IFundAyitiApplicationsPage = lazy(
  () => import("@/features/ifundayiti/ApplicationsPage"),
);
const IFundAyitiPeriodsPage = lazy(
  () => import("@/features/ifundayiti/ApplicationPeriodsPage"),
);
const IFundAyitiDonationsPage = lazy(
  () => import("@/features/ifundayiti/DonationsPage"),
);
const TeamPage = lazy(() => import("@/features/ifundayiti/TeamPage"));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<IFundAyitiOverviewPage />} />

            <Route path="store" element={<StorePage />} />
            <Route path="store/orders" element={<OrdersPage />} />
            <Route path="store/coupons" element={<CouponsPage />} />
            <Route path="store/refunds" element={<RefundsPage />} />
            <Route
              path="store/refunds/:refundId"
              element={<RefundDetailPage />}
            />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:eventSlug" element={<EventDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="applications"
              element={<IFundAyitiApplicationsPage />}
            />
            <Route
              path="periods"
              element={<IFundAyitiPeriodsPage />}
            />
            <Route
              path="donations"
              element={<IFundAyitiDonationsPage />}
            />
            <Route path="team" element={<TeamPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
