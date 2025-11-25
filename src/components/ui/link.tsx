"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function InteractiveLink({
  href,
  children,
}: React.ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const hrefString =
    typeof href === "string"
      ? href
      : typeof href === "object" && "pathname" in href
        ? href.pathname || ""
        : String(href);

  // avoid hydration mismatch
  if (!mounted) {
    return (
      <Link
        href={href}
        className="flex flex-col rounded-md font-medium text-sm hover:text-black"
      >
        <span className="px-3 py-1">{children}</span>
      </Link>
    );
  }

  // Handle full vs relative match
  const lastSegment = pathname?.split("/").pop() || "";
  const active = hrefString.startsWith("/")
    ? pathname === hrefString
    : lastSegment === hrefString;

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col rounded-md font-medium text-sm",
        active ? "text-black bg-background shadow" : "hover:text-black",
      )}
    >
      <span className="px-3 py-1">{children}</span>
    </Link>
  );
}
