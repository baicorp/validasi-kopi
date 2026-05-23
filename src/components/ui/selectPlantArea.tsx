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
import { getPlantAreas } from "@/actions/employees";

export default function SelectPlantArea({
  defaultValue,
}: {
  defaultValue?: string;
}) {
  const {
    data: plantAreas,
    isLoading,
    error,
  } = useSWR("plant-area", () => getPlantAreas());

  if (isLoading || error || !plantAreas || "error" in plantAreas) {
    return (
      <Select name="employee-plant-area" disabled>
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={`${isLoading ? "Loading..." : "Gagal mendapatkan data"}`}
          />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select name="employee-plant-area" defaultValue={defaultValue} required>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih area pabrik" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Daftar area pabrik</SelectLabel>
          {plantAreas.map((area) => (
            <SelectItem key={area.id} value={area.id}>
              {area.areaName}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
