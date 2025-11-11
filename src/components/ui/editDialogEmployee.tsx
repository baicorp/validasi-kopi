"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { toast } from "sonner";
import { FormEvent, useState } from "react";
import EmployeeForm, { EmployeeFormInputProps } from "../form/employeeForm";
import { DropdownMenuItem } from "./dropdown-menu";
import { updateEmployee } from "@/actions/employees";

export default function EditDialogEmployee({
  id,
  username,
  name,
  position,
}: {
  id: string;
} & EmployeeFormInputProps) {
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
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui karyawan.");
    } finally {
      setOpen(false);
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
        <EmployeeForm
          isLoad={isLoad}
          name={name}
          username={username}
          position={position}
          handleSubmit={handleEdit}
        />
      </DialogContent>
    </Dialog>
  );
}
