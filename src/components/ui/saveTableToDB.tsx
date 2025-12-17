"use client";

import { toast } from "sonner";
import { Button } from "./button";
import { useEffect, useState } from "react";
import { ExamDataDetails } from "@/lib/types";
import { Check, LoaderCircle } from "lucide-react";
import { addGeneratedCodes } from "@/actions/codes";

export default function SaveToDatabaseButton({
  examsData,
}: {
  examsData: ExamDataDetails;
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setIsSaved(false);
  }, [examsData]);

  async function handleClick() {
    try {
      setIsLoad(true);
      const result = await addGeneratedCodes(examsData);

      if ("error" in result) {
        toast.error(result.error);
        return;
      } else {
        setIsSaved(true);
      }

      toast.success("Data berhasil disimpan.");
    } catch (e) {
      console.error(e);
      toast.error("Ada yang salah.");
    } finally {
      setIsLoad(false);
    }
  }

  return isSaved ? (
    <Button
      variant={"ghost"}
      className="bg-green-500 hover:bg-green-400 hover:text-white text-white cursor-default"
    >
      {<Check />} Tersimpan
    </Button>
  ) : (
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
