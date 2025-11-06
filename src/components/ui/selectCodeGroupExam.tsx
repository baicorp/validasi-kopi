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
import { getCodeGroupsForExam } from "@/actions/codeGroups";

export default function SelectCodeGroupExam({
  defaultCodeGroupId,
  selectedExam,
  totalParticipants,
}: {
  defaultCodeGroupId: number | null;
  selectedExam: string;
  totalParticipants: number;
}) {
  const defaultValue = defaultCodeGroupId?.toString();
  return (
    <Select name="code-group-exam" required defaultValue={defaultValue}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih soal ujian" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItems
            selectedExam={selectedExam}
            totalParticipants={totalParticipants}
          />
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function SelectItems({
  selectedExam,
  totalParticipants,
}: {
  selectedExam: string;
  totalParticipants: number;
}) {
  const {
    data: codeGroupsExams,
    error,
    isLoading,
  } = useSWR(selectedExam, () =>
    getCodeGroupsForExam(selectedExam, totalParticipants),
  );

  if (error || !codeGroupsExams || "error" in codeGroupsExams) {
    return (
      <SelectItem disabled value="#">
        Gagal medapatakan daftar soal
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
        Belum ada soal yang dibuat untuk ujian ini
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
