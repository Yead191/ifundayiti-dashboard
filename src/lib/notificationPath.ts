/**
 * Maps backend notification paths to in-app router paths.
 * The API often returns `/dashboard/...` while this admin app uses shorter routes.
 */
const NOTIFICATION_PATH_MAP: Record<string, string> = {
  "/dashboard": "/",
  "/dashboard/bookings": "/services/bookings",
  "/dashboard/services": "/services",
  "/dashboard/services/bookings": "/services/bookings",
};

export function resolveNotificationPath(path?: string | null): string | null {
  if (!path?.trim()) return null;

  const normalized = path.trim().replace(/\/+$/, "") || "/";
  if (NOTIFICATION_PATH_MAP[normalized]) {
    return NOTIFICATION_PATH_MAP[normalized];
  }

  if (normalized.startsWith("/dashboard/")) {
    return normalized.slice("/dashboard".length) || "/";
  }

  return normalized;
}
