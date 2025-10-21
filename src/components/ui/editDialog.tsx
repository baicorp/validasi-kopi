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
import { updateProduct } from "@/actions/products";
import { DropdownMenuItem } from "./dropdown-menu";
import SelectProductCategories from "./selectProductCategories";

export default function EditDialog({
  productId,
  productName,
  productCategoryId,
}: {
  productId: string;
  productName: string;
  productCategoryId: string;
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const formData = new FormData(e.currentTarget);
    try {
      await updateProduct(Number(productId), formData);
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
          <DialogTitle>Edit Produk</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => handleEdit(e)}>
          <Input
            placeholder="Nama produk"
            name="nama-produk"
            defaultValue={productName}
          />
          <SelectProductCategories defaultValue={productCategoryId} />
          <Button type="submit" disabled={isLoad}>
            Simpan {isLoad && <LoaderCircle className="animate-spin" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
