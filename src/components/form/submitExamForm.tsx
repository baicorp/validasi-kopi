"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import { submitExam } from "@/actions/examSubmissions";
import { useParams, useRouter } from "next/navigation";
import { Answer } from "@/lib/types";
import { toast } from "sonner";

export default function SubmitExamForm({ children }: { children: ReactNode }) {
  const [isLoad, setIsLoad] = useState(false);
  const { id, nik } = useParams<{ id: string; nik: string }>();
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsLoad(true);
    // 1. get all input data
    const formData = new FormData(e.currentTarget);
    const submitData = formatInputData(formData);
    // 2. evaluate all user input data
    const result = await submitExam(submitData, id);
    if ("error" in result) {
      toast.error(result.error);
      setIsLoad(false);
      return;
    }
    setIsLoad(false);
    router.push(`/${nik}/hasil/${result.examEventId}`);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {children}
        <Button type="submit" disabled={isLoad}>
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
    </form>
  );
}

function formatInputData(formData: FormData) {
  const iden = getIdenInput(formData);
  const skoring = getSkoringInput(formData);
  const triangle = getTriangleInput(formData);
  const twoOutOfFive = getTwoOutOfFiveInput(formData);
  const tresholdSingle = getTresholdSingleInput(formData);
  const tresholdMix = getTresholdMixInput(formData);

  return [
    ...iden,
    ...skoring,
    ...triangle,
    ...twoOutOfFive,
    ...tresholdSingle,
    ...tresholdMix,
  ];
}

function getIdenInput(formData: FormData) {
  const examName = "identifikasi";
  const numb = [1, 2, 3, 4, 5];
  const userAnswer: Answer[] = [];

  numb.forEach((number) => {
    const code = formData.get(`${examName}-${number}-code`) as string;
    const value = formData.get(`${examName}-${number}-value`) as string;
    userAnswer.push({ examName, code, value });
  });

  return userAnswer;
}

function getSkoringInput(formData: FormData) {
  const examName = "skoring";
  const inputValues = ["1.5", "2", "3", "4", "5"];
  const userAnswer: Answer[] = [];

  inputValues.forEach((value) => {
    const code = formData.get(`${examName}-${value}`) as string;
    userAnswer.push({ examName, code, value });
  });

  return userAnswer;
}

function getTriangleInput(formData: FormData) {
  const examName = "triangle";
  const inputValues = ["beda", "sama", "sama"];
  const userAnswer: Answer[] = [];

  inputValues.forEach((value) => {
    const code = formData.get(`${examName}-${value}`) as string;
    userAnswer.push({ examName, code, value });
  });

  return userAnswer;
}

function getTwoOutOfFiveInput(formData: FormData) {
  const examNamePure = "2 out of 5 kopi pure";
  const examNameMix = "2 out of 5 campuran kopi";
  const inputValues = ["beda", "beda", "beda", "sama", "sama"];
  const userAnswer: Answer[] = [];

  inputValues.forEach((value, index) => {
    const codePure = formData.get(
      `${examNamePure}-${value}-${index}-code`,
    ) as string;
    const addValuePure = formData.get(
      `${examNamePure}-${value}-${index}-addValue`,
    ) as string;
    const codeMix = formData.get(
      `${examNameMix}-${value}-${index}-code`,
    ) as string;
    const addValueMix = formData.get(
      `${examNameMix}-${value}-${index}-addValue`,
    ) as string;
    userAnswer.push(
      {
        examName: examNamePure,
        code: codePure,
        value,
        additionalValue: addValuePure,
      },
      {
        examName: examNameMix,
        code: codeMix,
        value,
        additionalValue: addValueMix,
      },
    );
  });

  return userAnswer;
}

function getTresholdSingleInput(formData: FormData) {
  const examName = "treshold single";
  const numb = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const userAnswer: Answer[] = [];

  numb.forEach((number) => {
    const code = formData.get(`${examName}-${number}-code`) as string;
    const value = formData.get(`${examName}-${number}-value`) as string;
    const additionalValue = formData.get(
      `${examName}-${number}-addValue`,
    ) as string;
    userAnswer.push({ examName: examName, code, value, additionalValue });
  });

  return userAnswer;
}

function getTresholdMixInput(formData: FormData) {
  const examName = "treshold mix";
  const numb = [1, 2, 3, 4, 5];
  const userAnswer: Answer[] = [];

  numb.forEach((number) => {
    const code = formData.get(`${examName}-${number}-code`) as string;
    const value = formData.get(`${examName}-${number}-value`) as string;
    const additionalValue = formData.get(
      `${examName}-${number}-addValue`,
    ) as string;
    userAnswer.push({ examName: examName, code, value, additionalValue });
  });

  return userAnswer;
}
