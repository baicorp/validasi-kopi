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
import { updateRasaMix } from "@/actions/rasaMix";
import { LoaderCircle, Plus } from "lucide-react";
import { DropdownMenuItem } from "./dropdown-menu";

export default function EditDialogRasaMix({
  idRasaMix,
  rasaMix,
}: {
  idRasaMix: string;
  rasaMix: string;
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [rasa1, rasa2] = rasaMix.split(" + ");
  const [open, setOpen] = useState(false);

  async function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const formData = new FormData(e.currentTarget);
    try {
      await updateRasaMix(Number(idRasaMix), formData);
      setOpen(false);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
      toast.error("Gagal tambah produk.");
    } finally {
      setIsLoad(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          Edit
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Edit Rasa Treshold Mix</DialogTitle>
          <DialogTitle>Masukkan 2 rasa.</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => handleEdit(e)}>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Rasa 1"
              name="rasa-satu"
              required
              defaultValue={rasa1}
            />
            <Plus />
            <Input
              placeholder="Rasa 2"
              name="rasa-dua"
              required
              defaultValue={rasa2}
            />
          </div>
          <Button type="submit" disabled={isLoad}>
            Simpan {isLoad && <LoaderCircle className="animate-spin" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
