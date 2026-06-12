"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { exams } from "@/lib/constant";
import { LoaderCircle } from "lucide-react";
import { ReactNode, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { submitExam } from "@/actions/examSubmissions";
import { hasNoDuplicates } from "@/lib/submissionValidation";
import {
  Answer,
  ExamName,
  AnswerWithNote,
  AllTypeOfAnswer,
  AnswerWithAdditionalValue,
} from "@/lib/types";

export default function SubmitExamForm({ children }: { children: ReactNode }) {
  const [isLoad, setIsLoad] = useState(false);
  const [open, setOpen] = useState(false);
  const { id, nik } = useParams<{ id: string; nik: string }>();
  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoad(true);
    // 1. get all input data
    const formData = new FormData(e.currentTarget);
    const submitData = formatInputData(formData);
    // 2. evaluate all user input data
    try {
      if (!hasNoDuplicates(submitData)) {
        toast.error(
          "Kode atau nama produk yang dimasukkan tidak boleh ada duplikasi.",
        );
        setOpen(false);
        setIsLoad(false);
        return;
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
        toast.error(e.message);
      }
      setOpen(false);
      setIsLoad(false);
      return;
    }
    const result = await submitExam(submitData, id);
    if ("error" in result) {
      toast.error(result.error);
      setOpen(false);
      setIsLoad(false);
      return;
    }
    router.push(`/${nik}/hasil/${result.examEventId}`);
    setOpen(false);
    setIsLoad(false);
  }

  return (
    <form id="exam-form" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {children}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Kumpulkan jawaban</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Apakah Anda yakin ingin mengumpulkan semua jawaban?
              </DialogTitle>
              <DialogDescription>
                Setelah dikumpulkan, Anda tidak dapat mengubah jawaban.
                Lanjutkan?
              </DialogDescription>
              <div className="flex gap-2 mt-4">
                <Button
                  variant={"outline"}
                  className="grow"
                  onClick={() => setOpen(false)}
                >
                  Batalkan
                </Button>
                <Button
                  form="exam-form"
                  type="submit"
                  disabled={isLoad}
                  className="grow"
                >
                  {isLoad ? (
                    <>
                      <span>Mengumpulkan jawaban</span>
                      <LoaderCircle className="animate-spin mr-2" />
                    </>
                  ) : (
                    "Kumpulkan jawaban"
                  )}
                </Button>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </form>
  );
}

function formatInputData(formData: FormData): AllTypeOfAnswer[] {
  const inputData: AllTypeOfAnswer[] = [];
  const getInputFromExam: Record<
    ExamName,
    (formData: FormData, examName?: ExamName) => AllTypeOfAnswer[]
  > = {
    identifikasi: getIdenInput,
    skoring: getSkoringInput,
    triangle: getTriangleInput,
    "2 out of 5 pure": getTwoOutOfFiveInput,
    "2 out of 5 creamer": getTwoOutOfFiveInput,
    "2 out of 5 coklat": getTwoOutOfFiveInput,
    "treshold single": getTresholdSingleInput,
    "treshold mix": getTresholdMixInput,
  };
  const arrKeys = [...formData.keys()];
  for (const exam of exams) {
    const isExamHaveFormData = arrKeys.some((key) => key.includes(exam));
    if (!isExamHaveFormData) continue;
    if (exam.includes("2 out of 5")) {
      try {
        inputData.push(...getInputFromExam[exam](formData, exam));
      } catch (e) {
        if (e instanceof Error) {
          console.error(e.message);
        }
        console.error(e);
      }
      continue;
    }
    inputData.push(...getInputFromExam[exam](formData));
  }
  return inputData;
}

function getIdenInput(formData: FormData) {
  const examName = "identifikasi";
  const numb = [1, 2, 3, 4, 5];
  const userAnswer: Answer[] = [];

  numb.forEach((number) => {
    const code = formData.get(`${examName}-${number}-code`) as string;
    const value = formData.get(`${examName}-${number}-value`) as string;
    userAnswer.push({ examName, code, value, attemptNumber: 0 });
  });

  return userAnswer;
}

function getSkoringInput(formData: FormData) {
  const examName = "skoring";
  const inputValues = ["1.5", "2", "3", "4", "5"];
  const userAnswer: AnswerWithNote[] = [];
  const note = formData.get(`${examName}-note`) as string;

  inputValues.forEach((value) => {
    const code = formData.get(`${examName}-${value}`) as string;
    userAnswer.push({ examName, code, value, note, attemptNumber: 0 });
  });

  return userAnswer;
}

function getTriangleInput(formData: FormData) {
  const examName = "triangle";
  const inputValues = ["beda", "sama", "sama"];
  const userAnswer: AnswerWithNote[] = [];
  const note = formData.get(`${examName}-note`) as string;

  inputValues.forEach((value, index) => {
    const code = formData.get(`${examName}-${value}-${index}-code`) as string;
    userAnswer.push({ examName, code, value, note, attemptNumber: 0 });
  });

  return userAnswer;
}

function getTwoOutOfFiveInput(formData: FormData, examName?: ExamName) {
  if (!examName) {
    throw new Error("Nama ujian 2 out 5 tidak ditemukan.");
  }
  const inputValues = ["beda", "beda", "beda", "sama", "sama"];

  const userAnswer: AnswerWithAdditionalValue[] = inputValues.map(
    (value, index) => {
      const code = formData.get(`${examName}-${value}-${index}-code`) as string;
      const additionalValue = formData.get(
        `${examName}-${value}-${index}-addValue`,
      ) as string;
      return { examName, code, value, additionalValue, attemptNumber: 0 };
    },
  );

  return userAnswer;
}

function getTresholdSingleInput(formData: FormData) {
  const examName = "treshold single";
  const numb = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const userAnswer: AnswerWithAdditionalValue[] = [];

  numb.forEach((number) => {
    const code = formData.get(`${examName}-${number}-code`) as string;
    const value = formData.get(`${examName}-${number}-value`) as string;
    const additionalValue = formData.get(
      `${examName}-${number}-addValue`,
    ) as string;
    userAnswer.push({
      examName: examName,
      code,
      value,
      additionalValue,
      attemptNumber: 0,
    });
  });

  return userAnswer;
}

function getTresholdMixInput(formData: FormData) {
  const examName = "treshold mix";
  const numb = [1, 2, 3, 4, 5];
  const userAnswer: AnswerWithAdditionalValue[] = [];

  numb.forEach((number) => {
    const code = formData.get(`${examName}-${number}-code`) as string;
    const value = formData.get(`${examName}-${number}-value`) as string;
    const additionalValue = formData.get(
      `${examName}-${number}-addValue`,
    ) as string;
    userAnswer.push({
      examName: examName,
      code,
      value,
      additionalValue,
      attemptNumber: 0,
    });
  });

  return userAnswer;
}
