import { useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

export interface UseDebouncedSearchOptions {
  delay?: number;
  initialValue?: string;
}

/**
 * Controlled search state with a debounced, trimmed term ready for API queries.
 * Supports optional initialValue from URL query parameters.
 *
 * @example
 * const { value, setValue, debouncedValue } = useDebouncedSearch({ initialValue: urlSearch });
 * useGetServicesQuery({ searchTerm: debouncedValue });
 */
export function useDebouncedSearch(
  delayOrOptions: number | UseDebouncedSearchOptions = 400,
  fallbackInitial = ""
) {
  let delay = 400;
  let initialValue = "";

  if (typeof delayOrOptions === "object" && delayOrOptions !== null) {
    delay = delayOrOptions.delay ?? 400;
    initialValue = delayOrOptions.initialValue ?? "";
  } else if (typeof delayOrOptions === "number") {
    delay = delayOrOptions;
    initialValue = fallbackInitial;
  }

  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(value.trim(), delay);

  return { value, setValue, debouncedValue };
}
