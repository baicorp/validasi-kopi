"use client";

import { Badge } from "./badge";
import { Button } from "./button";
import { toTitleCase } from "@/lib/utils";
import { export_data } from "@/exportSheet";
import { ExamDataDetails } from "@/lib/types";
import SaveToDatabaseButton from "./saveTableToDB";

export default function ExamDetails({
  variant = "viewer",
  examDataDetails,
}: {
  variant?: "viewer" | "saver";
  examDataDetails: ExamDataDetails;
}) {
  return (
    <section className="py-4 border-y border-border bg-background z-10 sticky top-0">
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">
          Table Soal {toTitleCase(examDataDetails.groupName)}.
        </p>
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            onClick={() =>
              export_data(
                examDataDetails.formatedExamsData,
                `${examDataDetails.groupName} (${examDataDetails.selectedExam.replaceAll(",", ", ")})`,
              )
            }
          >
            Export Table
          </Button>
          {variant === "saver" && (
            <SaveToDatabaseButton examsData={examDataDetails} />
          )}
        </div>
      </div>
      <div className="grid grid-cols-[auto_auto_1fr] gap-x-2 text-muted-foreground w-fit">
        <p>Total peserta</p>
        <span>:</span>
        <p>{examDataDetails.totalParticipants}</p>
        <p>Daftar ujian</p>
        <span>:</span>
        <div className="flex gap-1 items-center">
          {examDataDetails.selectedExam.split(",").map((label) => (
            <Badge key={label} variant={"outline"}>
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
