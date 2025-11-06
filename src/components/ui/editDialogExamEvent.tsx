"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { toast } from "sonner";
import { Input } from "./input";
import { Button } from "./button";
import { FormEvent, useState } from "react";
import DateTimePicker from "./dateTimePicker";
import { LoaderCircle, SquarePen } from "lucide-react";
import { updateExamEvent } from "@/actions/examEvents";

export default function EditDialogExamEvent({
  eventId,
  registrationName,
  registerDefaultDateStart,
  registerDefaultTimeStart,
  registerDefaultDateEnd,
  registerDefaultTimeEnd,
  examDefaultDateStart,
  examDefaultTimeStart,
  examDefaultDateEnd,
  examDefaultTimeEnd,
}: {
  eventId: number;
  registrationName: string;
  registerDefaultDateStart: Date;
  registerDefaultTimeStart: string;
  registerDefaultDateEnd: Date;
  registerDefaultTimeEnd: string;
  examDefaultDateStart: Date;
  examDefaultTimeStart: string;
  examDefaultDateEnd: Date;
  examDefaultTimeEnd: string;
}) {
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
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui waktu ujian.");
    } finally {
      setIsLoad(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <span>Edit</span>
          <SquarePen />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Edit Data Ujian</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => handleEdit(e)}>
          <Input
            placeholder="Nama ujian"
            name="registration-name"
            required
            defaultValue={registrationName}
          />
          <DateTimePicker
            label="Pendaftaran dibuka"
            name="registration-start"
            defaultDate={registerDefaultDateStart}
            defaultTime={registerDefaultTimeStart}
          />
          <DateTimePicker
            label="Pendaftaran ditutup"
            name="registration-end"
            defaultDate={registerDefaultDateEnd}
            defaultTime={registerDefaultTimeEnd}
          />
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
      </DialogContent>
    </Dialog>
  );
}
