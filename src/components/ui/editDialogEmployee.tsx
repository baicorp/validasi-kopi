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
import { LoaderCircle } from "lucide-react";
import { DropdownMenuItem } from "./dropdown-menu";
import { updateEmployee } from "@/actions/employees";

export default function EditDialogEmployee({
  id,
  nik,
  name,
  position,
}: {
  id: string;
  nik: string;
  name: string;
  position: string;
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await updateEmployee(id, formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Berhasil memperbarui karyawan.");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui karyawan.");
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
          <DialogTitle>Edit Produk</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => handleEdit(e)}>
          <Input
            placeholder="NIK"
            defaultValue={nik}
            name="employee-nik"
            required
          />
          <Input
            placeholder="Nama Karyawan"
            defaultValue={name}
            name="employee-name"
            required
          />
          <Input
            placeholder="Jabatan"
            defaultValue={position}
            name="employee-position"
            required
          />
          <Input
            placeholder="Default password : supersecure"
            readOnly
            disabled
            name="employee-password"
            required
          />
          <Button type="submit" disabled={isLoad} className="ml-auto">
            Simpan
            {isLoad && <LoaderCircle className="animate-spin" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
