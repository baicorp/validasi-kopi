"use client";

import useSWR from "swr";
import {
  addSampleExamAnswer,
  deleteSampleExamAnswer,
  getExamValueFromExamEvent,
  getSampleExamAnswer,
} from "@/actions/examEvents";
import { toast } from "sonner";
import { Input } from "./input";
import { useState } from "react";
import { Button } from "./button";
import { LoaderCircle, TriangleAlert, X } from "lucide-react";

type Answer = { id: string; value: string; lock: boolean };

export default function ExamDummyAnswerInput({
  examName,
  examEventId,
}: {
  examEventId: string;
  examName: string;
}) {
  const { data: realAnswers, error: realAnswersError } = useSWR(
    `examValue-${examName}-${examEventId}`,
    () => getExamValueFromExamEvent(examName, examEventId),
    { revalidateOnFocus: false },
  );
  const {
    data: dummyAnswers,
    mutate: mutateDummy,
    error: dummyError,
  } = useSWR(
    `sampleAnswer-${examName}-${examEventId}`,
    () => getSampleExamAnswer(examEventId, examName),
    { revalidateOnFocus: false },
  );

  const isLoading = !dummyAnswers || !realAnswers;
  const hasError = dummyError || realAnswersError;

  if (hasError) {
    return (
      <div className="flex items-center gap-2 text-destructive mt-2">
        <TriangleAlert className="w-4 h-4 shrink-0" />
        <p className="text-sm">Gagal mendapatkan data jawaban.</p>
      </div>
    );
  }

  const answers =
    !isLoading && !("error" in dummyAnswers) && !("error" in realAnswers)
      ? [
          ...realAnswers.map((data) => ({
            id: data.id,
            value: data.value,
            lock: true,
          })),
          ...dummyAnswers.map((data) => ({
            id: data.id,
            value: data.value,
            lock: false,
          })),
        ]
      : [];

  return (
    <div>
      <AddDummyForm
        examName={examName}
        examEventId={examEventId}
        allAnswers={answers}
        isListLoading={isLoading}
        onAdded={(id, value) => {
          mutateDummy(
            (prev) => {
              if (!prev || "error" in prev) return prev;
              return [...prev, { id, value }];
            },
            { revalidate: true },
          );
        }}
      />
      <div className="flex flex-wrap gap-2 mt-2">
        {isLoading
          ? [1, 2, 3, 4, 5].map((numb) => (
              <div
                key={numb}
                className="w-28 h-10 bg-secondary border shadow rounded-md animate-pulse"
              />
            ))
          : answers.map((answer) => (
              <DummyItem
                key={answer.id}
                data={answer}
                onRemoved={(dummyId) => {
                  mutateDummy(
                    (prev) => {
                      if (!prev || "error" in prev) return prev;
                      return prev.filter((data) => data.id !== dummyId);
                    },
                    { revalidate: true },
                  );
                }}
              />
            ))}
      </div>
    </div>
  );
}

function AddDummyForm({
  examName,
  examEventId,
  allAnswers,
  isListLoading,
  onAdded,
}: {
  examName: string;
  examEventId: string;
  allAnswers: Answer[];
  isListLoading: boolean;
  onAdded: (id: string, newDummy: string) => void;
}) {
  const [dummyAnswer, setDummyAnswer] = useState("");
  const [addIsLoad, setAddIsLoad] = useState(false);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const trimmedDummyAnswer = dummyAnswer.trim();
    if (!trimmedDummyAnswer || isListLoading) return;

    if (
      allAnswers.some(
        (answer) =>
          answer.value.toLowerCase() === trimmedDummyAnswer.toLowerCase(),
      )
    ) {
      toast.error(`${trimmedDummyAnswer} sudah ada di daftar jawaban.`);
      return;
    }

    setAddIsLoad(true);
    const id = crypto.randomUUID();
    const result = await addSampleExamAnswer(
      id,
      examEventId,
      trimmedDummyAnswer,
      examName,
    );
    if ("error" in result) {
      toast.error(result.error);
    } else if (result.rowsAffected > 0) {
      onAdded(id, trimmedDummyAnswer);
      setDummyAnswer("");
    }
    setAddIsLoad(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-2">
      <Input
        placeholder={`Masukkan daftar jawaban ujian ${examName}`}
        value={dummyAnswer}
        onChange={(e) => setDummyAnswer(e.currentTarget.value)}
      />
      <Button type="submit" disabled={addIsLoad || isListLoading}>
        <span>Tambah</span>
        {addIsLoad && <LoaderCircle className="animate-spin" />}
      </Button>
    </form>
  );
}

function DummyItem({
  data,
  onRemoved,
}: {
  data: Answer;
  onRemoved: (dummyId: string) => void;
}) {
  const [deleteIsLoad, setDeleteIsLoad] = useState(false);

  const handleDelete = async () => {
    setDeleteIsLoad(true);
    const result = await deleteSampleExamAnswer(data.id);
    if ("error" in result) {
      toast.error(result.error);
      setDeleteIsLoad(false);
      return;
    }
    if (result.rowsAffected > 0) {
      onRemoved(data.id);
    }
    setDeleteIsLoad(false);
  };

  return (
    <div
      className={`flex items-center bg-secondary border ${data.lock ? "px-3 py-2" : "pl-3"} shadow rounded-md`}
    >
      <span>{data.value}</span>
      {!data.lock && (
        <Button variant="ghost" onClick={handleDelete} disabled={deleteIsLoad}>
          {deleteIsLoad ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <X className="w-5 h-5 cursor-pointer" />
          )}
        </Button>
      )}
    </div>
  );
}
