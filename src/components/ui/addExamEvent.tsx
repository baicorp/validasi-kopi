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
import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import ExamEventForm from "../form/examEventForm";
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
        <Button className="flex items-center gap-2 font-medium">
          <Plus className="w-4 h-4" />
          Buat Ujian Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Buat Ujian Baru</DialogTitle>
        </DialogHeader>
        <ExamEventForm isLoad={isLoad} handleSubmit={handleAddExamEvent} />
      </DialogContent>
    </Dialog>
  );
}
