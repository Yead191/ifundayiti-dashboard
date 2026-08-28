import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AuthGateLoader } from "@/components/ui/AuthGateLoader";
import { useGetProfileQuery } from "@/redux/features/auth/authApi";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const { data: profile, isLoading } = useGetProfileQuery();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.message("Signed out", {
      description: "You've been logged out of Hubology admin.",
    });
    navigate("/login", { replace: true });
  };

  if (isLoading) {
    return <AuthGateLoader />;
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (profile.data.role !== "SUPER_ADMIN") {
    toast.error("You are not authorized to access this page");
    handleLogout();
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
