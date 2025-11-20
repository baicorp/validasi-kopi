"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { useState } from "react";
import { toTitleCase } from "@/lib/utils";
import { basicExam } from "@/lib/constant";
import { useRouter } from "next/navigation";
import { ExamDataDetails } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ExamDetail from "@/components/ui/examDetail";
import ExamsTable from "@/components/table/examsTable";
import { CheckedState } from "@radix-ui/react-checkbox";
import { generateExamCodes } from "@/lib/handleFormInput";
import { validateSessionClient } from "@/app/sign-in/page";
import OptionForTresholdMix from "@/components/ui/optioinForTM";
import InputParticipants from "@/components/ui/inputParticipant";
import OptionForTresholdSingle from "@/components/ui/optioinForTS";

export default function Page() {
  const router = useRouter();
  const { data: session } = useSWR("session", validateSessionClient);
  if (session?.data && session.data.user.role !== "admin") {
    router.replace(`/user/${session.data.user.username}`);
  }

  const [selectedExam, setSelectedExam] = useState<string[]>([]);
  const [examDataDetails, setExamDataDetails] = useState<ExamDataDetails>();

  function handleSelectedExamChange(e: CheckedState, examName: string) {
    setExamDataDetails(undefined); // reset table data
    if (e && !selectedExam.includes(examName)) {
      setSelectedExam((prev) => [...prev, examName].sort());
    } else if (!e) {
      setSelectedExam((prev) => prev.filter((exam) => exam !== examName));
    }
  }

  function handleGenerateCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const examDataDetails = generateExamCodes(formData, selectedExam);

    if ("error" in examDataDetails) {
      toast.error(examDataDetails.error);
      return;
    }

    setExamDataDetails(examDataDetails);
  }

  return (
    <>
      <section className="py-3 bg-background border-b">
        <p className="text-lg font-semibold">Buat Soal Uji Dasar</p>
        <div className="grid grid-cols-2 w-fit gap-x-3 gap-y-2 mt-2.5">
          {basicExam.map((exam) => {
            const checkboxId = exam.replaceAll(" ", "-");
            return (
              <Label key={exam} htmlFor={checkboxId} className="font-normal">
                <Checkbox
                  id={checkboxId}
                  onCheckedChange={(e) => handleSelectedExamChange(e, exam)}
                />
                <span>{toTitleCase(exam)}</span>
              </Label>
            );
          })}
        </div>
      </section>
      <section>
        <form className="flex flex-col gap-6" onSubmit={handleGenerateCode}>
          <div className="flex flex-col gap-6 md:flex-row md:gap-6 lg:gap-8">
            {selectedExam.includes("2 out of 5 campuran kopi") && (
              <div className="basis-full">
                <TwoOutOfFive variant="campuran kopi" />
              </div>
            )}
            {selectedExam.includes("2 out of 5 kopi pure") && (
              <div className="basis-full">
                <TwoOutOfFive variant="kopi pure" />
              </div>
            )}
          </div>
          {selectedExam.includes("treshold single") && (
            <OptionForTresholdSingle />
          )}
          {selectedExam.includes("treshold mix") && <OptionForTresholdMix />}
          {selectedExam.length !== 0 && (
            <>
              <InputParticipants />
              <Button type="submit">Buat Soal Uji Dasar</Button>
            </>
          )}
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

function TwoOutOfFive({ variant }: { variant: "campuran kopi" | "kopi pure" }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="flex items-center gap-2">
          <Label
            className="font-medium"
            htmlFor={variant === "kopi pure" ? "include-pure" : ""}
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
                  variant === "campuran kopi"
                    ? "2-out-of-5-campuran-kopi-values"
                    : "2-out-of-5-kopi-pure-values"
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
