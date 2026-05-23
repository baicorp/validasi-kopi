"use client";

import { getAllProductCategories } from "@/actions/productCategories";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
import useSWR from "swr";

export default function SelectProductCategories({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const {
    data: categories,
    isLoading,
    error,
  } = useSWR("productCategories", () => getAllProductCategories());

  if (isLoading || error || !categories || "error" in categories) {
    return (
      <Select name="product-category" disabled>
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={`${isLoading ? "Loading..." : "Gagal mendapatkan data"}`}
          />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select name="product-category" defaultValue={defaultValue} required>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih kategori produk" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>kategori</SelectLabel>
          {categories.map((category, index) => (
            <SelectItem key={index} value={category.id}>
              {category.categoryName}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
