"use client";

import { toast } from "sonner";
import { Button } from "./button";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { saveSoalUji } from "@/actions/kode";
import { SoalUjiClientStructure } from "@/lib/types";
import { toTitleCase, formatToDB } from "@/lib/utils";

export default function SaveToDatabaseButton({
  jenisUji,
  soal,
}: {
  jenisUji: string;
  soal: SoalUjiClientStructure[];
}) {
  const [isLoad, setIsLoad] = useState(false);

  async function handleClick() {
    try {
      setIsLoad(true);
      const arrDataForDB = formatToDB(
        toTitleCase(jenisUji) + new Date().toLocaleString("id-ID"),
        soal,
      );

      await saveSoalUji(arrDataForDB);
      toast.success("Data berhasil disimpan.");
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
      toast.error("Ada yang salah.");
    } finally {
      setIsLoad(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isLoad}
      variant={"outline"}
      className="cursor-pointer"
    >
      Simpan ke database
      {isLoad && <LoaderCircle className="animate-spin" />}
    </Button>
  );
}
