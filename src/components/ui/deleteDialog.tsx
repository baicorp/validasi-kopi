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
import { useState } from "react";
import { Button } from "./button";
import { toTitleCase } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { DropdownMenuItem } from "./dropdown-menu";

type DeleteAction = (id: string) => Promise<
  | {
      error: string;
    }
  | undefined
>;

export default function DeleteDialog({
  id,
  variant = "default",
  data,
  dialogTitle,
  deleteFnAction,
}: {
  id: string;
  variant?: "default" | "dropDown";
  data: string;
  dialogTitle: string;
  deleteFnAction: DeleteAction;
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);

    const result = await deleteFnAction(id);

    if (result?.error) {
      toast.error(result.error);
      setOpen(false);
      setIsLoad(false);
      return;
    }

    setOpen(false);
    setIsLoad(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {variant === "dropDown" ? (
        <DialogTrigger asChild>
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => e.preventDefault()}
          >
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
          <p>
            Yakin Hapus <span className="font-bold">{data}</span>
          </p>
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
