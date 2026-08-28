/**
 * Centralized runtime configuration.
 *
 * Values are read from Vite env vars (see `.env`) so the same build can point
 * at different backends per environment, falling back to the LAN dev server.
 */

const DEV_HOST =
  (import.meta.env.VITE_IMAGE_URL as string) ||
  "https://api.thehubology.com" ||
  "http://10.10.26.173:5003";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? `${DEV_HOST}/api/v1`;

/** Base path for server-hosted files (avatars, documents, uploads). */
export const IMAGE_URL = import.meta.env.VITE_IMAGE_URL ?? `${DEV_HOST}/files`;

/** Socket.IO / websocket origin. */
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? DEV_HOST;

/** localStorage key used to persist the auth token across sessions. */
export const TOKEN_KEY = "token";

/** Prefix a stored file path with the files host, e.g. "/avatars/x.png". */
export function toFileUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${IMAGE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
