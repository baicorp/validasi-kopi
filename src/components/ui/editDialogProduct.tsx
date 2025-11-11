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
import { updateProduct } from "@/actions/products";
import { DropdownMenuItem } from "./dropdown-menu";
import ProductForm, { ProductFormInputProps } from "../form/productForm";

export default function EditDialogProduct({
  productId,
  productName,
  productCategoryId,
}: {
  productId: string;
} & ProductFormInputProps) {
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
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui produk.");
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
        <ProductForm
          handleSubmit={handleEdit}
          isLoad={isLoad}
          productName={productName}
          productCategoryId={productCategoryId}
        />
      </DialogContent>
    </Dialog>
  );
}
