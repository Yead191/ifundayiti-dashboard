export function getErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred.";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    if (err.data?.message) return err.data.message;
    if (err.message) return err.message;
    if (err.error) return err.error;
  }
  return "An unexpected error occurred.";
}
