"use client";

import { NormalizedExamData } from "@/actions/examSubmissions";
import { Button } from "./button";
import { buildExamSheet } from "@/exportSheet";

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
        buildExamSheet(listExams, data);
      }}
    >
      Export Hasil Ujian
    </Button>
  );
}
