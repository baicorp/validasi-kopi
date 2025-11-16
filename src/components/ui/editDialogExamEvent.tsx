"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { toast } from "sonner";
import { Button } from "./button";
import { SquarePen } from "lucide-react";
import { FormEvent, useState } from "react";
import { updateExamEvent } from "@/actions/examEvents";
import ExamEventForm, { ExamEventFormInputProps } from "../form/examEventForm";

export default function EditDialogExamEvent({
  eventId,
  eventName,
  codeGroupReguler,
  codeGroupRetake,
  examDefaultDateStart,
  examDefaultTimeStart,
  examDefaultDateEnd,
  examDefaultTimeEnd,
}: {
  eventId: number;
} & ExamEventFormInputProps) {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await updateExamEvent(formData, eventId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Berhasil memperbarui waktu ujian.");
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui waktu ujian.");
    } finally {
      setOpen(false);
      setIsLoad(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SquarePen />
          <span>Edit</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Edit Data Ujian</DialogTitle>
        </DialogHeader>
        <ExamEventForm
          handleSubmit={handleEdit}
          isLoad={isLoad}
          eventName={eventName}
          codeGroupReguler={codeGroupReguler}
          codeGroupRetake={codeGroupRetake}
          examDefaultDateStart={examDefaultDateStart}
          examDefaultTimeStart={examDefaultTimeStart}
          examDefaultDateEnd={examDefaultDateEnd}
          examDefaultTimeEnd={examDefaultTimeEnd}
        />
      </DialogContent>
    </Dialog>
  );
}
