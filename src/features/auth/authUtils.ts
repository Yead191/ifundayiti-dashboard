/** Pull a human-readable message out of an RTK Query error. */
export function getAuthErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (typeof error === "object" && error !== null) {
    const err = error as {
      data?: { message?: string };
      error?: string;
      message?: string;
    };
    return err.data?.message ?? err.message ?? err.error ?? fallback;
  }
  return fallback;
}

export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(local.length - 2, 2))}@${domain}`;
}
