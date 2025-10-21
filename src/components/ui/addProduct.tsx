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
import { addProduct } from "@/actions/products";
import { LoaderCircle, Plus } from "lucide-react";
import SelectProductCategories from "./selectProductCategories";

export default function AddProductBtn() {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleTambahProduk(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const formData = new FormData(e.currentTarget);
    try {
      await addProduct(formData);
    } catch (e) {
      console.error(e);
      toast.error(
        "Gagal menambahkan produk, pastikan produk belum pernah ditambahkan sebelumnya.",
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
          Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Tambah Produk</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => handleTambahProduk(e)}>
          <Input placeholder="Nama produk" name="nama-produk" required />
          <SelectProductCategories />
          <Button type="submit" disabled={isLoad} className="ml-auto">
            Simpan
            {isLoad && <LoaderCircle className="animate-spin" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
