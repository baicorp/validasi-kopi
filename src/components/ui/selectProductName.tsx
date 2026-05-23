"use client";

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
import { getListValuesFromExamName } from "@/actions/examEvents";

export default function SelectProductName({
  inputName,
  examName,
  examEventId,
}: {
  inputName: string;
  examName: string;
  examEventId: string;
}) {
  const {
    data: codeValues,
    isLoading,
    error,
  } = useSWR([examName, examEventId], () =>
    getListValuesFromExamName(examName, examEventId),
  );

  if (isLoading || error || !codeValues || "error" in codeValues) {
    return (
      <Select name={inputName} disabled>
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={`${isLoading ? "Loading..." : "Gagal mendapatkan data"}`}
          />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select name={inputName} required>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih nama produk" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Daftar nama produk</SelectLabel>
          {codeValues.map((value, index) => (
            <SelectItem key={index} value={value!}>
              {value && value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
