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
  const { data: departmentData, isLoading } = useSWR(
    "departments",
    getDepartments,
  );

  if (departmentData === undefined || "error" in departmentData) {
    return <p>Data Not found</p>;
  }

  return (
    <Select name="employee-department" defaultValue={defaultValue} required>
      <SelectTrigger className="w-full">
        {isLoading ? (
          <SelectValue placeholder="Loading..." />
        ) : (
          <SelectValue placeholder="Pilih departemen" />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Daftar departemen</SelectLabel>
          {departmentData.map((department) => (
            <SelectItem key={department.id} value={department.id.toString()}>
              {department.departmentName}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
