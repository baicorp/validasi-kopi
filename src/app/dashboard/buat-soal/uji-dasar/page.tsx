"use client";

import { toast } from "sonner";
import { useState } from "react";
import { toTitleCase } from "@/lib/utils";
import { basicExam } from "@/lib/constant";
import { ExamDataDetails } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ExamDetail from "@/components/ui/examDetail";
import ExamsTable from "@/components/table/examsTable";
import { generateExamCodes } from "@/lib/handleFormInput";
import OptionForTresholdMix from "@/components/ui/optioinForTM";
import InputParticipants from "@/components/ui/inputParticipant";
import OptionForTresholdSingle from "@/components/ui/optioinForTS";

export default function Page() {
  const [examDataDetails, setExamDataDetails] = useState<ExamDataDetails>();

  function handleGenerateCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const examDataDetails = generateExamCodes(formData, basicExam);

    if ("error" in examDataDetails) {
      toast.error(examDataDetails.error);
      return;
    }

    setExamDataDetails(examDataDetails);
  }

  return (
    <>
      <section className="py-3 bg-background">
        <p className="text-lg font-semibold">Buat Soal Uji Dasar</p>
      </section>
      <section>
        <form className="flex flex-col gap-6" onSubmit={handleGenerateCode}>
          <div className="flex flex-col gap-6 md:flex-row md:gap-6 lg:gap-8">
            <div className="basis-full">
              <TwoOutOfFive variant="creamer" />
            </div>
            <div className="basis-full">
              <TwoOutOfFive variant="pure" />
            </div>
          </div>
          <OptionForTresholdSingle />
          <OptionForTresholdMix />
          <InputParticipants />
          <Button type="submit">Buat Soal Uji Dasar</Button>
        </form>
      </section>
      {examDataDetails && (
        <>
          <ExamDetail variant="saver" examDataDetails={examDataDetails} />
          <ExamsTable formatedExamsData={examDataDetails.formatedExamsData} />
        </>
      )}
    </>
  );
}

function TwoOutOfFive({ variant }: { variant: "creamer" | "pure" }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="flex items-center gap-2">
          <Label
            className="font-medium"
            htmlFor={variant === "pure" ? "include-pure" : ""}
          >
            2 Out of 5 {toTitleCase(variant)}
          </Label>
        </div>
        <span className="block text-sm text-muted-foreground mt-1">
          Masukkan produk {variant} untuk 2 Out Of 5.
        </span>
      </div>
      <div>
        <div className="flex flex-col gap-1.5">
          {["sama", "beda 1", "beda 2", "beda 3"].map((nilai, index) => {
            return (
              <Input
                key={index}
                // IMPORTANT: ensure this name matches basicExam in constant.ts
                // replace all space with "-" and end with "-values"
                name={
                  variant === "creamer"
                    ? "2-out-of-5-creamer-values"
                    : "2-out-of-5-pure-values"
                }
                placeholder={`Produk untuk nilai ${nilai}`}
                required
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
