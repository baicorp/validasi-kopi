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
import { addEmployee } from "@/actions/employees";
import { LoaderCircle, Plus } from "lucide-react";

export default function AddEmployeeBtn() {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleAddEmployee(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const formData = new FormData(e.currentTarget);
    try {
      const newEmployee = await addEmployee(formData);
      if ("error" in newEmployee) {
        toast.error(newEmployee.error);
        return;
      }
      toast.success("Berhasil menambahkan karyawan.");
    } catch (e) {
      console.error(e);
      toast.error("Gagal menambahkan karyawan.");
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
          Tambah Karyawan
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Tambah Karyawan</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => handleAddEmployee(e)}>
          <Input placeholder="NIK" name="employee-nik" required />
          <Input placeholder="Nama Karyawan" name="employee-name" required />
          <Input placeholder="Jabatan" name="employee-position" required />
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
