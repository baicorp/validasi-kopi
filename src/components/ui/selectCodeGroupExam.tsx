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
  return (
    <Select name="code-group-exam" required>
      <SelectTrigger className="w-full max-w-[334px]">
        <SelectValue placeholder="Pilih soal ujian" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItems />
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function SelectItems() {
  const {
    data: codeGroupsExams,
    isLoading,
    error,
  } = useSWR("codeGroups", getCodeGroupsForExam);

  if (isLoading) {
    return (
      <SelectItem disabled value="#" className="text-center">
        Loading...
      </SelectItem>
    );
  }

  if (error || !codeGroupsExams || "error" in codeGroupsExams) {
    return (
      <SelectItem disabled value={"undefined"}>
        Gagal medapatakan daftar soal {error}
      </SelectItem>
    );
  }

  if (codeGroupsExams.length === 0) {
    return (
      <SelectItem disabled value="#" className="text-center">
        Belum ada soal yang dibuat.
      </SelectItem>
    );
  }

  return (
    <>
      <SelectLabel>Daftar soal ujian</SelectLabel>
      {codeGroupsExams.map((group) => (
        <SelectItem key={group.id} value={group.id.toString()}>
          <span>
            {group.groupName}{" "}
            <span className="text-muted-foreground">#{group.id}</span>
          </span>
          <span className="text-xs text-muted-foreground">
            {group.createdAt}
          </span>
        </SelectItem>
      ))}
    </>
  );
}
