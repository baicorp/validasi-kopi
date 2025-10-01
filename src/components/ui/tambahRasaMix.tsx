"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { toast } from "sonner";
import { Input } from "./input";
import { Button } from "./button";
import { FormEvent, useState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { addRasaMix } from "@/actions/rasaMix";

export default function TambahRasaMix() {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleTambahRasaMix(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const formData = new FormData(e.currentTarget);
    try {
      await addRasaMix(formData);
    } catch (e) {
      if (e instanceof Error) {
        // toast.error(e.message);
        // return;
      }
      toast.error(
        "Gagal menambahkan rasa, pastikan kombinasi rasa belum pernah ditambahkan.",
      );
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
          Tambah Rasa Mix
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Tambah Rasa Treshold Mix</DialogTitle>
          <DialogDescription>Masukkan 2 rasa.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => handleTambahRasaMix(e)}>
          <div className="flex items-center gap-2">
            <Input placeholder="Rasa 1" name="rasa-satu" required />
            <Plus />
            <Input placeholder="Rasa 2" name="rasa-dua" required />
          </div>
          <Button type="submit" disabled={isLoad} className="ml-auto">
            Simpan
            {isLoad && <LoaderCircle className="animate-spin" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
