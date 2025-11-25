"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InteractiveLink({
  href,
  children,
}: React.ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const active = pathname.split("/").slice(-1).toString() === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col rounded-md font-medium text-sm",
        active ? "text-black bg-background shadow" : " hover:text-black",
      )}
    >
      <span className="px-3 py-1">{children}</span>
    </Link>
  );
}
