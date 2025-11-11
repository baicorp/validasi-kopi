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
import EmployeeForm from "../form/employeeForm";
import { addEmployee } from "@/actions/employees";

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
        <EmployeeForm handleSubmit={handleAddEmployee} isLoad={isLoad} />
      </DialogContent>
    </Dialog>
  );
}
