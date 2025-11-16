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
  const { data: plantAreas, isLoading } = useSWR("plant-area", getPlantAreas);

  if (plantAreas === undefined || "error" in plantAreas) {
    return <p>Data Not found</p>;
  }

  return (
    <Select name="employee-plant-area" defaultValue={defaultValue} required>
      <SelectTrigger className="w-full">
        {isLoading ? (
          <SelectValue placeholder="Loading..." />
        ) : (
          <SelectValue placeholder="Pilih area pabrik" />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Daftar area pabrik</SelectLabel>
          {plantAreas.map((area) => (
            <SelectItem key={area.id} value={area.id.toString()}>
              {area.areaName}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
