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
import { LoaderCircle, Plus } from "lucide-react";
import { addExamEvent } from "@/actions/examEvents";

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
      toast.success("Berhasil membuka pendaftaran ujian.");
    } catch (e) {
      console.error(e);
      toast.error("Gagal membuka pendaftaran ujian.");
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
          Buka Pendaftaran Ujian
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Buka pendaftaran ujian</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => handleAddExamEvent(e)}>
          <Input placeholder="Nama ujian" name="registration-name" required />
          <DateTimePicker
            label="Pendaftaran dibuka"
            name="registration-start"
          />
          <DateTimePicker label="Pendaftaran ditutup" name="registration-end" />
          <DateTimePicker label="Ujian dibuka" name="event-start" />
          <DateTimePicker label="Ujian ditutup" name="event-end" />
          <Button type="submit" disabled={isLoad} className="ml-auto">
            Buka Pendaftaran
            {isLoad && <LoaderCircle className="animate-spin" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
