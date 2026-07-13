"use client";

import { Input } from "./input";
import { useEffect, useState } from "react";
import { parseAsString, useQueryStates } from "nuqs";

export default function SearchData({ placeholder }: { placeholder: string }) {
  const [{ q: query }, setParams] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      page: parseAsString.withDefault(""),
    },
    { shallow: false, history: "replace" },
  );
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (inputValue.trim() !== query) {
        setParams({ q: inputValue.trim() || null, page: null }); // one atomic update
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputValue.trim()]);

  return (
    <Input
      type="search"
      value={inputValue}
      onChange={(e) => setInputValue(e.currentTarget.value)}
      placeholder={placeholder}
    />
  );
}
