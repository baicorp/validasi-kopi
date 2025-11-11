"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { toast } from "sonner";
import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { FormEvent, useState } from "react";
import DateTimePicker from "./dateTimePicker";
import { LoaderCircle, Plus } from "lucide-react";
import { addExamEvent } from "@/actions/examEvents";
import SelectCodeGroupExam from "./selectCodeGroupExam";

export default function AddExamEventBtn() {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleAddExamEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await addExamEvent(formData);

      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Berhasil membuat ujian baru.");
    } catch (e) {
      console.error(e);
      toast.error("Gagal membuat ujian baru.");
    } finally {
      setOpen(false);
      setIsLoad(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild className="ml-auto">
        <Button className="flex items-center gap-2 font-normal">
          <Plus className="w-4 h-4" />
          Buat Ujian Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Buat Ujian Baru</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => handleAddExamEvent(e)}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="event-name">Soal ujian</Label>
            <Input
              id="event-name"
              placeholder="Nama ujian"
              name="event-name"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Soal ujian</Label>
            <SelectCodeGroupExam />
          </div>
          <DateTimePicker label="Ujian dibuka" name="event-start" />
          <DateTimePicker label="Ujian ditutup" name="event-end" />
          <Button type="submit" disabled={isLoad} className="ml-auto">
            Buat Ujian
            {isLoad && <LoaderCircle className="animate-spin" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
