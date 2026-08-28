import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  logout as logoutAction,
  selectCurrentUser,
  selectIsAuthenticated,
} from "@/redux/features/auth/authSlice";

/**
 * Thin, ergonomic accessor over the auth slice. Components read the current
 * user / auth status and trigger logout without touching Redux directly.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  return {
    user,
    isAuthenticated,
    logout: () => dispatch(logoutAction()),
  };
}
