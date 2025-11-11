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
import ProductForm from "../form/productForm";
import { addProduct } from "@/actions/products";

export default function AddProductBtn() {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleAddProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const formData = new FormData(e.currentTarget);
    try {
      const result = await addProduct(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Berhasil menambahkan produk.");
    } catch (e) {
      console.error(e);
      toast.error("Gagal menambahkan produk.");
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
          Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Tambah Produk</DialogTitle>
        </DialogHeader>
        <ProductForm handleSubmit={handleAddProduct} isLoad={isLoad} />
      </DialogContent>
    </Dialog>
  );
}
