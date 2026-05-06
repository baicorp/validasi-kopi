"use client";

import { useSearchParams } from "next/navigation";
import {
  DisableLinkNext,
  DisableLinkPrev,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

export default function Paginator({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();
  const pageNumbers = [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]
    .filter((numb) => numb >= 1 && numb <= totalPages)
    .slice(0, 4);

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `?${params.toString()}`;
  };

  const listPaginationItem = pageNumbers.map((pageNumber) => (
    <PaginationItem key={pageNumber}>
      <PaginationLink
        isActive={pageNumber === currentPage}
        href={createPageURL(pageNumber)}
      >
        {pageNumber}
      </PaginationLink>
    </PaginationItem>
  ));

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {currentPage <= 1 ? (
            <DisableLinkPrev />
          ) : (
            <PaginationPrevious href={createPageURL(currentPage - 1)} />
          )}
        </PaginationItem>
        {listPaginationItem}
        <PaginationItem>
          {currentPage >= totalPages ? (
            <DisableLinkNext />
          ) : (
            <PaginationNext href={createPageURL(currentPage + 1)} />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
