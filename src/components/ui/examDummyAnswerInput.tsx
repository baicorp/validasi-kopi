"use client";

import useSWR from "swr";
import {
  addSampleExamAnswer,
  deleteSampleExamAnswer,
  getExamThatNeedDummyData,
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
    <div className="grid grid-cols-2 gap-8">
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
  const { data, isLoading, error } = useSWR(examName, () =>
    getSampleExamAnswer(examEventId, examName),
  );

  const [listDummyData, setListDummyData] = useState<string[]>([]);
  const [dummy, setDummy] = useState("");
  const [addIsLoad, setAddIsLoad] = useState(false);

  useEffect(() => {
    if (data && !("error" in data) && Array.isArray(data)) {
      setListDummyData(data);
    }
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorComp error="Gagal mendapatkan list jawaban tambahan" />;
  }

  if (data !== undefined && "error" in data) {
    return <ErrorComp error={data.error} />;
  }

  return (
    <div key={examName}>
      <p className="font-medium">
        JAWABAN TAMBAHAN UJIAN {examName.toUpperCase()}
      </p>
      <p className="text-muted-foreground mb-1">
        Masukkan daftar jawaban tambahan untuk {examName}
      </p>
      <div className="flex gap-2 items-center">
        <Input
          placeholder="Masukkan data dummy"
          value={dummy}
          onChange={(e) => setDummy(e.currentTarget.value)}
        />
        <Button
          disabled={addIsLoad}
          onClick={async () => {
            const trimmedDummy = dummy.trim();
            if (trimmedDummy.length === 0) {
              return;
            }
            const isFound = listDummyData.some(
              (data) =>
                data.trim().toLowerCase() === trimmedDummy.trim().toLowerCase(),
            );
            if (isFound) {
              toast.error(`${trimmedDummy} sudah ditambahkan.`);
              return;
            }
            setAddIsLoad(true);
            const result = await addSampleExamAnswer(
              examEventId,
              trimmedDummy,
              examName,
            );
            // result is rowsAffected
            if ("error" in result) {
              toast.error(result.error);
              setAddIsLoad(false);
              return;
            }
            if (result.rowsAffected > 0) {
              setListDummyData((prev) => [...prev, trimmedDummy]);
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
        {listDummyData.map((data) => (
          <DummyItem
            key={data}
            examEventId={examEventId}
            examName={examName}
            setList={setListDummyData}
            value={data}
          />
        ))}
      </div>
    </div>
  );
}

function DummyItem({
  value,
  examName,
  examEventId,
  setList,
}: {
  value: string;
  examName: string;
  examEventId: string;
  setList: Dispatch<SetStateAction<string[]>>;
}) {
  const [deleteIsLoad, setDeleteIsLoad] = useState(false);

  return (
    <div
      key={value}
      className="flex items-center gap-2 bg-secondary border px-4 shadow rounded-md"
    >
      <span>{value}</span>
      <Button
        variant="ghost"
        onClick={async () => {
          setDeleteIsLoad(true);
          const result = await deleteSampleExamAnswer(
            examEventId,
            examName,
            value,
          );
          if ("error" in result) {
            toast.error(result.error);
            setDeleteIsLoad(false);
            return;
          }
          if (result.rowsAffected > 0) {
            setList((prev) => prev.filter((p) => p !== value));
          }
          setDeleteIsLoad(false);
        }}
      >
        {deleteIsLoad ? (
          <LoaderCircle className="animate-spin mr-2" />
        ) : (
          <X className="w-5 h-5 cursor-pointer" />
        )}
      </Button>
    </div>
  );
}
