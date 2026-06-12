"use client";

import useSWR from "swr";
import Link from "next/link";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { toTitleCase } from "@/lib/utils";
import { utcToWIB } from "@/lib/datetimeFormat";
import DateTimePicker from "../ui/dateTimePicker";
import { getCodeGroupById } from "@/actions/codeGroups";
import { Calendar, LoaderCircle, User } from "lucide-react";
import SelectCodeGroupExam from "../ui/selectCodeGroupExam";
import SelectedCodeGroupCardSkeleton from "../skeleton/selectedCodeGroupCardSkeleton";

export interface ExamEventFormInputProps {
  eventName?: string;
  codeGroupReguler?: string;
  codeGroupRetake?: string;
  examDefaultDateStart?: Date;
  examDefaultDateEnd?: Date;
  examDefaultTimeStart?: string;
  examDefaultTimeEnd?: string;
}

export default function ExamEventForm({
  eventName,
  codeGroupReguler,
  codeGroupRetake,
  examDefaultDateStart,
  examDefaultDateEnd,
  examDefaultTimeStart,
  examDefaultTimeEnd,
  isLoad,
  handleSubmit,
}: ExamEventFormInputProps & {
  isLoad: boolean;
  handleSubmit: (e: React.SubmitEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
      <div className="space-y-2">
        <Label htmlFor="event-name">Nama ujian</Label>
        <Input
          id="event-name"
          placeholder="Nama ujian"
          name="event-name"
          defaultValue={eventName}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Pilih soal untuk ujian reguler</Label>
        {codeGroupReguler ? (
          <SelectedCodeGroupCard codeGroupId={codeGroupReguler} />
        ) : (
          <SelectCodeGroupExam />
        )}
      </div>
      <div className="space-y-2">
        <Label>Pilih soal untuk ujian mengulang (1-3)</Label>
        {codeGroupRetake ? (
          <SelectedCodeGroupCard codeGroupId={codeGroupRetake} />
        ) : (
          <SelectCodeGroupExam />
        )}
      </div>
      <DateTimePicker
        label="Ujian dibuka"
        name="event-start"
        defaultDate={examDefaultDateStart}
        defaultTime={examDefaultTimeStart}
      />
      <DateTimePicker
        label="Ujian ditutup"
        name="event-end"
        defaultDate={examDefaultDateEnd}
        defaultTime={examDefaultTimeEnd}
      />
      <Button type="submit" disabled={isLoad} className="ml-auto">
        {eventName ? "Simpan perubahan" : "Buat ujian"}
        {isLoad && <LoaderCircle className="animate-spin" />}
      </Button>
    </form>
  );
}

function SelectedCodeGroupCard({ codeGroupId }: { codeGroupId: string }) {
  const {
    data: codeGroup,
    isLoading,
    error,
  } = useSWR(["codeGroup", codeGroupId], () => getCodeGroupById(codeGroupId));

  if (isLoading) {
    return <SelectedCodeGroupCardSkeleton />;
  }

  if (!codeGroup || "error" in codeGroup || error) {
    return (
      <div className="p-2 rounded-lg border text-muted-foreground">
        <p>Gagal mendapatkan soal</p>
      </div>
    );
  }

  return (
    <div className="p-2.5 rounded-lg border text-sm text-muted-foreground space-y-2">
      <Link href={`/dashboard/daftar-soal/${codeGroupId}`}>
        <p className="font-medium">
          {toTitleCase(codeGroup.groupName)} <span>#{codeGroup.id}</span>
        </p>
      </Link>
      <div className="flex flex-wrap gap-1.5 mt-1.5">
        {codeGroup.selectedExam?.map((exam) => (
          <Badge
            key={exam}
            variant={"secondary"}
            className="text-muted-foreground"
          >
            {exam}
          </Badge>
        ))}
      </div>
      <div className="flex gap-4">
        <div className="flex gap-2 items-center">
          <Calendar className="w-3 h-3" />
          <p>{utcToWIB(codeGroup.createdAt || "")}</p>
        </div>
        <div className="flex gap-2 items-center">
          <User className="w-3 h-3" />
          <p>{codeGroup.totalParticipants}</p>
        </div>
      </div>
    </div>
  );
}
