"use client";

import { Input } from "./input";
import { useEffect } from "react";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";

export default function SearchData({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const [query, setQuery] = useQueryState("q", { defaultValue: "" });
  const [_, setPage] = useQueryState("page", { defaultValue: "" });

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.refresh();
    }, 100);

    return () => clearTimeout(timeout);
  }, [query, router]);

  return (
    <Input
      type="search"
      value={query}
      onChange={(e) => {
        setPage("");
        setQuery(e.target.value || null);
      }}
      placeholder={placeholder}
    />
  );
}
