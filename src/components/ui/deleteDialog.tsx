"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { toast } from "sonner";
import { Button } from "./button";
import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { DropdownMenuItem } from "./dropdown-menu";
import { toTitleCase } from "@/lib/utils";

export default function DeleteDialog({
  variant = "default",
  dialogTitle,
  deleteFnAction,
  idProduk,
  namaProduk,
}: {
  variant?: "default" | "dropDown";
  dialogTitle: string;
  deleteFnAction: (id: string) => Promise<void>;
  idProduk: string;
  namaProduk: string;
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    try {
      await deleteFnAction(idProduk);
      setOpen(false);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
      toast.error("Gagal hapus produk.");
    } finally {
      setIsLoad(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {variant === "dropDown" ? (
        <DialogTrigger asChild>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Hapus
          </DropdownMenuItem>
        </DialogTrigger>
      ) : (
        <DialogTrigger className="text-destructive">Hapus</DialogTrigger>
      )}
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Hapus {toTitleCase(dialogTitle)}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleDelete} className="flex flex-col gap-4">
          <p>Yakin Hapus {namaProduk}</p>
          <div className="flex gap-2 mt-4">
            <DialogClose asChild>
              <Button variant={"outline"}>Tidak</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isLoad}
              variant={"destructive"}
              className="w-24"
            >
              Hapus {isLoad && <LoaderCircle className="animate-spin" />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
