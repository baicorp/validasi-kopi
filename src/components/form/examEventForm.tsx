import { FormEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import DateTimePicker from "../ui/dateTimePicker";
import SelectCodeGroupExam from "../ui/selectCodeGroupExam";

export interface ExamEventFormInputProps {
  eventName?: string;
  codeGroupId?: number;
  examDefaultDateStart?: Date;
  examDefaultDateEnd?: Date;
  examDefaultTimeStart?: string;
  examDefaultTimeEnd?: string;
}

export default function ExamEventForm({
  eventName,
  codeGroupId,
  examDefaultDateStart,
  examDefaultDateEnd,
  examDefaultTimeStart,
  examDefaultTimeEnd,
  isLoad,
  handleSubmit,
}: ExamEventFormInputProps & {
  isLoad: boolean;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="event-name">Nama ujian</Label>
        <Input
          id="event-name"
          placeholder="Nama ujian"
          name="event-name"
          defaultValue={eventName}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label>Soal ujian</Label>
        <SelectCodeGroupExam defaultCodeGroupId={codeGroupId ?? undefined} />
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
        Simpan perubahan
        {isLoad && <LoaderCircle className="animate-spin" />}
      </Button>
    </form>
  );
}
