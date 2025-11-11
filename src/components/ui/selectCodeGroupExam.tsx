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
import { getCodeGroupById, getCodeGroupsForExam } from "@/actions/codeGroups";

export default function SelectCodeGroupExam({
  defaultCodeGroupId,
}: {
  defaultCodeGroupId?: number;
}) {
  const defaultValue = defaultCodeGroupId?.toString();
  return (
    <Select
      disabled={defaultCodeGroupId ? true : false}
      name="code-group-exam"
      required
      defaultValue={defaultValue}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih soal ujian" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItems defaultValue={defaultCodeGroupId} />
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function SelectItems({ defaultValue }: { defaultValue?: number }) {
  const {
    data: codeGroupsExams,
    isLoading,
    error,
  } = useSWR(
    defaultValue ? ["codeGroups", defaultValue] : "codeGroups",
    defaultValue ? () => getCodeGroupById(defaultValue) : getCodeGroupsForExam,
  );

  if (error || !codeGroupsExams || "error" in codeGroupsExams) {
    return (
      <SelectItem disabled value={"undefined"}>
        Gagal medapatakan daftar soal {error}
      </SelectItem>
    );
  }

  if (isLoading) {
    return (
      <SelectItem disabled value="#" className="text-center">
        Loading...
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
          <span>{group.groupName}</span>
          <span className="text-xs text-muted-foreground">
            {group.createdAt}
          </span>
        </SelectItem>
      ))}
    </>
  );
}
