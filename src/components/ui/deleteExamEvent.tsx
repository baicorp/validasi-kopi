"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { toast } from "sonner";
import { Button } from "./button";
import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { DropdownMenuItem } from "./dropdown-menu";
import { deleteExamEvent } from "@/actions/examEvents";

export default function DeleteDialogExamEvent({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const result = await deleteExamEvent(eventId);

    if ("error" in result) {
      toast.error(result.error);
      setOpen(false);
      setIsLoad(false);
      return;
    }

    toast.success(`Berhasil menghapus acara ujian ${eventName}.`);

    setOpen(false);
    setIsLoad(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Hapus
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Hapus Acara Ujian</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleDelete} className="flex flex-col gap-4">
          <p>
            Yakin Hapus <span className="font-bold">{eventName}</span>
          </p>
          <div className="flex gap-2 mt-4">
            <DialogClose asChild>
              <Button variant={"outline"}>Tidak</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoad}
              variant={"destructive"}
              className="w-24"
            >
              Hapus {isLoad && <LoaderCircle className="animate-spin" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
