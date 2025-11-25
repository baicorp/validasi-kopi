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
import { getDepartments } from "@/actions/employees";

export default function SelectDepartment({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const {
    data: departmentData,
    isLoading,
    error,
  } = useSWR("departments", () => getDepartments());

  if (isLoading) {
    return (
      <Select name="employee-department" disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error || !departmentData || "error" in departmentData) {
    return (
      <Select name="employee-department" disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Gagal mendapatkan data" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select name="employee-department" defaultValue={defaultValue} required>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih departemen" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Daftar departemen</SelectLabel>
          {departmentData.map((department) => (
            <SelectItem key={department.id} value={department.id}>
              {department.departmentName}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
