import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<typeof Link>;

function PaginationLink({
  className,
  isActive,
  // size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Link
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          // size,
        }),
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      // size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      // size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <ChevronRightIcon />
    </PaginationLink>
  );
}

export function DisableLinkNext() {
  return (
    <Button className="gap-1 px-2.5 sm:pr-2.5" disabled variant={"secondary"}>
      <ChevronRightIcon />
    </Button>
  );
}
export function DisableLinkPrev() {
  return (
    <Button className="gap-1 px-2.5 sm:pr-2.5" disabled variant={"secondary"}>
      <ChevronLeftIcon />
    </Button>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

function DataPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pageNumbers = [page - 1, page, page + 1].filter(
    (numb) => numb >= 1 && numb <= totalPages,
  );

  const listPaginationItem = pageNumbers.map((pageNumber) => {
    return (
      <PaginationItem key={pageNumber}>
        <PaginationLink
          isActive={pageNumber === page}
          href={`/dashboard/produk?page=${pageNumber}`}
        >
          {pageNumber}
        </PaginationLink>
      </PaginationItem>
    );
  });

  return (
    <Pagination>
      <PaginationContent>
        {page > 1 && (
          <PaginationItem>
            <PaginationPrevious href={`/dashboard/produk?page=${page - 1}`} />
          </PaginationItem>
        )}
        {listPaginationItem}
        {page <= totalPages && (
          <PaginationItem>
            <PaginationNext href={`/dashboard/produk?page=${page + 1}`} />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  DataPagination,
};
