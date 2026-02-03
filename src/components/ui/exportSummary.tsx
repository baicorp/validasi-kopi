"use client";

import { toast } from "sonner";
import { Button } from "./button";
import { buildExamSheet } from "@/exportSheet";
import { NormalizedExamData } from "@/actions/examSubmissions";

export default function ExportSummary({
  listExams,
  data,
}: {
  listExams: string[];
  data: NormalizedExamData[];
}) {
  return (
    <Button
      variant={"outline"}
      onClick={async () => {
        if (data.length === 0) {
          toast.error("Tidak bisa export .xlsx karena data masih kosong");
          return;
        }
        buildExamSheet(listExams, data);
      }}
    >
      Export Hasil Ujian
    </Button>
  );
}
