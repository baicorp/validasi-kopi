"use client";

import useSWR from "swr";
import {
  addSampleExamAnswer,
  deleteSampleExamAnswer,
  getExamThatNeedDummyData,
  getExamValueFromExamEvent,
  getSampleExamAnswer,
} from "@/actions/examEvents";
import { toast } from "sonner";
import { Input } from "./input";
import ErrorComp from "./error";
import { Button } from "./button";
import Loading from "../skeleton/loading";
import { LoaderCircle, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function ExamDummyAnswerInput({
  examEventId,
}: {
  examEventId: string;
}) {
  const { data, isLoading, error } = useSWR(examEventId.toString(), () =>
    getExamThatNeedDummyData(examEventId),
  );

  if (isLoading) {
    return <Loading />;
  }

  if (!data || "error" in data || error) {
    return <ErrorComp error={error} />;
  }

  return (
    <div
      className={`grid ${data.length === 1 ? "grid-cols-1" : "grid-cols-2"} gap-8`}
    >
      {data.map((exam) => (
        <FormDummy
          key={exam.examName}
          examEventId={examEventId}
          examName={exam.examName}
        />
      ))}
    </div>
  );
}

function FormDummy({
  examName,
  examEventId,
}: {
  examEventId: string;
  examName: string;
}) {
  const { data: dummyFromDB } = useSWR(examName, () =>
    getSampleExamAnswer(examEventId, examName),
  );

  const { data: realAnswers } = useSWR([examName, examEventId], () =>
    getExamValueFromExamEvent(examName, examEventId),
  );

  const [listDummyData, setListDummyData] = useState<
    { value: string; lock: boolean }[]
  >([]);
  const [dummy, setDummy] = useState("");
  const [addIsLoad, setAddIsLoad] = useState(false);

  useEffect(() => {
    if (dummyFromDB && !("error" in dummyFromDB)) {
      setListDummyData(
        dummyFromDB.map((data) => ({ value: data, lock: false })),
      );
    }
  }, [dummyFromDB]);

  // combine realAnswers and dummyData
  const allAnswers = [
    ...(realAnswers && !("error" in realAnswers)
      ? realAnswers.map((data) => ({ value: data, lock: true }))
      : []),
    ...listDummyData,
  ];

  return (
    <div>
      <p className="font-medium">
        DAFTAR JAWABAN UJIAN {examName.toUpperCase()}
      </p>

      <div className="flex gap-2 items-center mt-2">
        <Input
          placeholder={`Masukkan daftar jawaban ujian ${examName}`}
          value={dummy}
          onChange={(e) => setDummy(e.currentTarget.value)}
        />

        <Button
          disabled={addIsLoad}
          onClick={async () => {
            const trimmed = dummy.trim();
            if (!trimmed) return;

            // check for duplication
            if (
              allAnswers.some(
                (answer) =>
                  answer.value.toLowerCase() === trimmed.toLowerCase(),
              )
            ) {
              toast.error(`${trimmed} sudah ada di daftar jawaban.`);
              return;
            }

            setAddIsLoad(true);
            const result = await addSampleExamAnswer(
              examEventId,
              trimmed,
              examName,
            );

            if ("error" in result) {
              toast.error(result.error);
            } else if (result.rowsAffected > 0) {
              setListDummyData((prev) => [
                ...prev,
                { value: trimmed, lock: false },
              ]);
            }

            setAddIsLoad(false);
            setDummy("");
          }}
        >
          Tambah
          {addIsLoad && <LoaderCircle className="animate-spin mr-2" />}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {allAnswers.map((data, index) => (
          <DummyItem
            key={index}
            examEventId={examEventId}
            examName={examName}
            setList={setListDummyData}
            data={data}
          />
        ))}
      </div>
    </div>
  );
}

function DummyItem({
  data,
  examName,
  examEventId,
  setList,
}: {
  data: { value: string; lock: boolean };
  examName: string;
  examEventId: string;
  setList: Dispatch<SetStateAction<{ value: string; lock: boolean }[]>>;
}) {
  const [deleteIsLoad, setDeleteIsLoad] = useState(false);

  return (
    <div
      className={`flex items-center bg-secondary border ${data.lock ? "px-3 py-2" : "pl-3"} shadow rounded-md`}
    >
      <span>{data.value}</span>
      {!data.lock && (
        <Button
          variant="ghost"
          onClick={async () => {
            setDeleteIsLoad(true);
            const result = await deleteSampleExamAnswer(
              examEventId,
              examName,
              data.value,
            );
            if ("error" in result) {
              toast.error(result.error);
              setDeleteIsLoad(false);
              return;
            }
            if (result.rowsAffected > 0) {
              setList((prev) => prev.filter((p) => p.value !== data.value));
            }
            setDeleteIsLoad(false);
          }}
        >
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
