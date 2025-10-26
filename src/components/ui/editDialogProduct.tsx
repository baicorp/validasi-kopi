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

export default function EditDialogProduct({
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
      const result = await updateProduct(Number(productId), formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Berhasil memperbarui produk.");
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui produk.");
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
