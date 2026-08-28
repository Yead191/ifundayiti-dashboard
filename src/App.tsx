import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageLoader } from "@/components/ui/PageLoader";
import OrdersPage from "./features/orders/OrdersPage";

// Route-level code splitting keeps the initial bundle lean — each page's
// chunk is only fetched when the admin actually navigates there.
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/ForgotPasswordPage"));
const VerifyOtpPage = lazy(() => import("@/features/auth/VerifyOtpPage"));
const ResetPasswordPage = lazy(() => import("@/features/auth/ResetPasswordPage"));
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage"));
const DashboardOverviewPage = lazy(() => import("@/features/dashboard/DashboardOverviewPage"));
const ServicesPage = lazy(() => import("@/features/services/ServicesPage"));
const ServiceBookingsPage = lazy(() => import("@/features/services/ServiceBookingsPage"));
const VendorsPage = lazy(() => import("@/features/vendors/VendorsPage"));
const UsersPage = lazy(() => import("@/features/users/UsersPage"));
const StorePage = lazy(() => import("@/features/store/StorePage"));
const CouponsPage = lazy(() => import("@/features/coupons/CouponsPage"));
const RefundsPage = lazy(() => import("@/features/refunds/RefundsPage"));
const RefundDetailPage = lazy(() => import("@/features/refunds/RefundDetailPage"));
const MembershipPage = lazy(() => import("@/features/membership/MembershipPage"));
const MembershipFaqPage = lazy(() => import("@/features/membership/MembershipFaqPage"));
const MembershipSubscribersPage = lazy(() => import("@/features/membership/MembershipSubscribersPage"));
const TransactionsPage = lazy(() => import("@/features/transactions/TransactionsPage"));
const ForumModerationPage = lazy(() => import("@/features/forum/ForumModerationPage"));
const ForumPostDetailPage = lazy(() => import("@/features/forum/ForumPostDetailPage"));
const TestimonialsPage = lazy(() => import("@/features/testimonials/TestimonialsPage"));
const EventsPage = lazy(() => import("@/features/events/EventsPage"));
const EventDetailPage = lazy(() => import("@/features/events/EventDetailPage"));
const PartnersPage = lazy(() => import("@/features/partners/PartnersPage"));
const PartnerDetailPage = lazy(() => import("@/features/partners/PartnerDetailPage"));
const InquiriesPage = lazy(() => import("@/features/inquiries/InquiriesPage"));
const DisclaimerEditorPage = lazy(() => import("@/features/disclaimer/DisclaimerEditorPage"));
const IFundAyitiOverviewPage = lazy(() => import("@/features/ifundayiti/IFundAyitiOverviewPage"));
const IFundAyitiApplicationsPage = lazy(() => import("@/features/ifundayiti/ApplicationsPage"));
const IFundAyitiPeriodsPage = lazy(() => import("@/features/ifundayiti/ApplicationPeriodsPage"));
const IFundAyitiDonationsPage = lazy(() => import("@/features/ifundayiti/DonationsPage"));

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
            <Route index element={<DashboardOverviewPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/bookings" element={<ServiceBookingsPage />} />
            <Route path="vendors" element={<VendorsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="store" element={<StorePage />} />
            <Route path="store/orders" element={<OrdersPage />} />
            <Route path="store/coupons" element={<CouponsPage />} />
            <Route path="store/refunds" element={<RefundsPage />} />
            <Route path="store/refunds/:refundId" element={<RefundDetailPage />} />
            <Route path="membership" element={<MembershipPage />} />
            <Route path="membership/faq" element={<MembershipFaqPage />} />
            <Route path="membership/:membershipId/subscribers" element={<MembershipSubscribersPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="forum" element={<ForumModerationPage />} />
            <Route path="forum/:postId" element={<ForumPostDetailPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:eventSlug" element={<EventDetailPage />} />
            <Route path="partners" element={<PartnersPage />} />
            <Route path="partners/:partnerId" element={<PartnerDetailPage />} />
            <Route path="inquiries" element={<InquiriesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="disclaimer/:type" element={<DisclaimerEditorPage />} />
            <Route path="ifundayiti" element={<IFundAyitiOverviewPage />} />
            <Route path="ifundayiti/applications" element={<IFundAyitiApplicationsPage />} />
            <Route path="ifundayiti/periods" element={<IFundAyitiPeriodsPage />} />
            <Route path="ifundayiti/donations" element={<IFundAyitiDonationsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
