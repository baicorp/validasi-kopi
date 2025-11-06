"use client";

import { toast } from "sonner";
import { Button } from "./button";
import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import SelectCodeGroupExam from "./selectCodeGroupExam";
import { assignCodeGroupExam } from "@/actions/examRegistrations";

export default function CodeGroupExamForm({
  codeGroupId,
  selectedExam,
  participants,
}: {
  codeGroupId: number | null;
  selectedExam: string;
  participants: {
    username: string;
    name: string;
    position: string;
    codeGroupId: number | null;
    selectedExam: string;
  }[];
}) {
  const [isLoad, setIsLoad] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setIsLoad(true);
    const result = await assignCodeGroupExam({ formData, selectedExam });

    if (!result || "error" in result) {
      toast.error(result?.error || "Ada yang salah.");
      setIsLoad(false);
      return;
    }

    toast.success(
      `Berhasil memperbarui soal ujian untuk uji : ${selectedExam}`,
    );
    setIsLoad(false);
  }

  return (
    <form className="flex gap-4" onSubmit={handleSubmit}>
      <div className="w-full">
        <p className="font-medium mb-1">Soal ujian</p>
        <SelectCodeGroupExam
          defaultCodeGroupId={codeGroupId}
          selectedExam={selectedExam}
          totalParticipants={participants.length}
        />
      </div>
      <Button type="submit" disabled={isLoad} className="self-end">
        Simpan
        {isLoad && <LoaderCircle className="animate-spin" />}
      </Button>
    </form>
  );
}
