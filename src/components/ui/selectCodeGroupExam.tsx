"use client";

import useSWR from "swr";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
import { getCodeGroupsForExam } from "@/actions/codeGroups";

export default function SelectCodeGroupExam() {
  const {
    data: codeGroupsExams,
    isLoading,
    error,
  } = useSWR("codeGroups", () => getCodeGroupsForExam());

  if (isLoading) {
    return (
      <Select name="code-group-exam" disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (error || !codeGroupsExams || "error" in codeGroupsExams) {
    return (
      <Select name="code-group-exam" disabled>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Gagal mendapatkan data" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select name="code-group-exam" required>
      <SelectTrigger className="w-full max-w-[334px]">
        <SelectValue placeholder="Pilih soal ujian" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Daftar soal ujian</SelectLabel>
          {codeGroupsExams.map((group) => (
            <SelectItem key={group.id} value={group.id}>
              <span>
                {group.groupName}{" "}
                <span className="text-muted-foreground">#{group.id}</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {group.createdAt}
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
