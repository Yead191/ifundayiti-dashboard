import { useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

/**
 * Controlled search state with a debounced, trimmed term ready for API queries.
 *
 * @example
 * const { value, setValue, debouncedValue } = useDebouncedSearch();
 * useGetServicesQuery({ searchTerm: debouncedValue });
 */
export function useDebouncedSearch(delay = 400) {
  const [value, setValue] = useState("");
  const debouncedValue = useDebouncedValue(value.trim(), delay);

  return { value, setValue, debouncedValue };
}
