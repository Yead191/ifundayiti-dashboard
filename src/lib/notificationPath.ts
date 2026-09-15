/**
 * Maps backend notification paths to in-app router paths.
 * The API often returns `/dashboard/...`, `/orders/...`, or standalone module paths,
 * while this admin dashboard uses specific nested routes (e.g. `/shop/orders`).
 */

const EXACT_PATH_MAP: Record<string, string> = {
  "/": "/",
  "/dashboard": "/",
  "/orders": "/shop/orders",
  "/order": "/shop/orders",
  "/store/orders": "/shop/orders",
  "/shop/orders": "/shop/orders",
  "/dashboard/orders": "/shop/orders",
  "/donations": "/donations",
  "/donation": "/donations",
  "/fund-transactions": "/donations",
  "/admin/donations": "/donations",
  "/dashboard/donations": "/donations",
  "/transactions": "/transactions",
  "/transaction": "/transactions",
  "/admin/transactions": "/transactions",
  "/admin/financials": "/transactions",
  "/dashboard/transactions": "/transactions",
  "/applications": "/applications",
  "/application": "/applications",
  "/admin/applications": "/applications",
  "/dashboard/applications": "/applications",
  "/periods": "/periods",
  "/dashboard/periods": "/periods",
  "/grant-cycles": "/periods",
  "/projects": "/projects",
  "/project": "/projects",
  "/dashboard/projects": "/projects",
  "/gallery": "/gallery",
  "/dashboard/gallery": "/gallery",
  "/refunds": "/store/refunds",
  "/refund": "/store/refunds",
  "/store/refunds": "/store/refunds",
  "/dashboard/refunds": "/store/refunds",
  "/coupons": "/store/coupons",
  "/coupon": "/store/coupons",
  "/store/coupons": "/store/coupons",
  "/dashboard/coupons": "/store/coupons",
  "/events": "/events",
  "/event": "/events",
  "/admin/events": "/events",
  "/dashboard/events": "/events",
  "/event-bookings": "/event-bookings",
  "/admin/event-bookings": "/event-bookings",
  "/event-checkin": "/event-checkin",
  "/admin/event-checkin": "/event-checkin",
  "/booking": "/event-bookings",
  "/bookings": "/event-bookings",
  "/admin/bookings": "/event-bookings",
  "/dashboard/bookings": "/event-bookings",
  "/blogs": "/blogs",
  "/blog": "/blogs",
  "/dashboard/blogs": "/blogs",
  "/team": "/team",
  "/dashboard/team": "/team",
  "/partners": "/partners",
  "/partner": "/partners",
  "/dashboard/partners": "/partners",
  "/faq": "/faq",
  "/faqs": "/faq",
  "/dashboard/faq": "/faq",
  "/profile": "/profile",
  "/dashboard/profile": "/profile",
  "/notifications": "/notifications",
  "/notification": "/notifications",
  "/admin/notifications": "/notifications",
  "/dashboard/notifications": "/notifications",
  "/users": "/users",
  "/user": "/users",
  "/admin/users": "/users",
  "/dashboard/users": "/users",
  "/subscriptions": "/transactions",
  "/membership": "/transactions",
};

/**
 * Resolves any backend notification path into the valid frontend dashboard route.
 * Handles prefix stripping, deep links with IDs, and fallbacks.
 */
export function resolveNotificationPath(path?: string | null): string {
  if (!path || !path.trim()) {
    return "/notifications";
  }

  let normalized = path.trim();

  // Ensure leading slash
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  // Remove trailing slashes (except root)
  normalized = normalized.replace(/\/+$/, "") || "/";

  // Check exact match
  if (EXACT_PATH_MAP[normalized]) {
    return EXACT_PATH_MAP[normalized];
  }

  // Strip `/dashboard` or `/admin` prefix if present
  if (normalized.startsWith("/dashboard/")) {
    normalized = normalized.slice("/dashboard".length);
  } else if (normalized.startsWith("/admin/")) {
    normalized = normalized.slice("/admin".length);
  }

  // Re-check exact map after prefix stripping
  if (EXACT_PATH_MAP[normalized]) {
    return EXACT_PATH_MAP[normalized];
  }

  // Deep linking pattern matching with IDs:
  // /orders/:id or /order/:id -> /shop/orders/:id
  const orderMatch = normalized.match(/^\/(?:shop\/orders|store\/orders|orders|order)\/([^/?#]+)/i);
  if (orderMatch) {
    return `/shop/orders/${orderMatch[1]}`;
  }

  // /refunds/:id or /refund/:id -> /store/refunds/:id
  const refundMatch = normalized.match(/^\/(?:store\/refunds|refunds|refund)\/([^/?#]+)/i);
  if (refundMatch) {
    return `/store/refunds/${refundMatch[1]}`;
  }

  // /applications/:id or /application/:id -> /applications/:id
  const appMatch = normalized.match(/^\/(?:applications|application)\/([^/?#]+)/i);
  if (appMatch) {
    return `/applications/${appMatch[1]}`;
  }

  // /projects/:id or /project/:id -> /projects/:id
  const projectMatch = normalized.match(/^\/(?:projects|project)\/([^/?#]+)/i);
  if (projectMatch) {
    return `/projects/${projectMatch[1]}`;
  }

  // /partners/:id or /partner/:id -> /partners/:id
  const partnerMatch = normalized.match(/^\/(?:partners|partner)\/([^/?#]+)/i);
  if (partnerMatch) {
    return `/partners/${partnerMatch[1]}`;
  }

  // /blogs/:id or /blog/:id -> /blogs/:id
  const blogMatch = normalized.match(/^\/(?:blogs|blog)\/([^/?#]+)/i);
  if (blogMatch) {
    return `/blogs/${blogMatch[1]}`;
  }

  // /events/:slug -> /events/:slug
  const eventMatch = normalized.match(/^\/(?:events|event)\/([^/?#]+)/i);
  if (eventMatch) {
    return `/events/${eventMatch[1]}`;
  }

  // /bookings/:id or /booking/:id or /ticket/:id -> /event-bookings/:id
  const bookingMatch = normalized.match(/^\/(?:event-bookings|bookings|booking|ticket)\/([^/?#]+)/i);
  if (bookingMatch) {
    return `/event-bookings/${bookingMatch[1]}`;
  }

  // /gallery/folder/:id or /gallery/:id -> /gallery/folder/:id
  const galleryMatch = normalized.match(/^\/gallery\/(?:folder\/)?([^/?#]+)/i);
  if (galleryMatch) {
    return `/gallery/folder/${galleryMatch[1]}`;
  }

  // /users/:id or /user/:id -> /users/:id
  const userMatch = normalized.match(/^\/(?:users|user)\/([^/?#]+)/i);
  if (userMatch) {
    return `/users/${userMatch[1]}`;
  }

  return normalized;
}
