import { useEffect, useState } from "react";

export function useDebounce<T>(input: T, delay = 200): T {
  const [debounceValue, setDebounceValue] = useState(input);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceValue(input);
    }, delay);

    return () => clearTimeout(timeout);
  }, [input, delay]);

  return debounceValue;
}
