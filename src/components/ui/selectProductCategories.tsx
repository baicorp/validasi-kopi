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
  const { data: listKategori } = useSWR(
    "listCategory",
    getAllProductCategories,
  );

  if (listKategori === undefined || "error" in listKategori) {
    return <p>Data Not found</p>;
  }

  return (
    <Select name="product-category" defaultValue={defaultValue} required>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih kategori produk" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>kategori</SelectLabel>
          {listKategori.map((category, index) => (
            <SelectItem key={index} value={category.id.toString()}>
              {category.categoryName}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
