import { useEffect, useState } from "react";

/** Returns `value` only after it has stayed unchanged for `delay` ms. */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const actualDelay = typeof value === "string" && !value.trim() ? 50 : delay;
    const timer = window.setTimeout(() => setDebounced(value), actualDelay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
