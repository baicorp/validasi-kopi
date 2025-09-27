"use client";

import { getAllCategory } from "@/actions/kategory";
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

export default function SelectListKategori({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const { data: listKategori } = useSWR("listCategory", getAllCategory);

  return (
    <Select name="kategori-produk" defaultValue={defaultValue} required>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih kategori produk" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>kategori</SelectLabel>
          {listKategori?.map((kategori, index) => (
            <SelectItem key={index} value={kategori?.id.toString()}>
              {kategori?.kategori}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
