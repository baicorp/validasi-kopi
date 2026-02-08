"use client";

import { useState } from "react";
import { Separator } from "./separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { getSubmissionSummary } from "@/actions/examSubmissions";
import Loading from "../skeleton/loading";
import ErrorComp from "./error";
import { Label } from "./label";

const numberAttempts = [
  { attempt: 1, description: "Ujian Reguler" },
  { attempt: 2, description: "Ujian Mengulang 1" },
  { attempt: 3, description: "Ujian Mengulang 2" },
  { attempt: 4, description: "Ujian Mengulang 3" },
];

export default function UserAnswerList() {
  const [attempts] = useState(numberAttempts);
  const [selectedAttempt, setSelectedAttempt] = useState(
    attempts[0].attempt.toString(),
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2 pb-8 border-b">
        <Label htmlFor="attempt">Pilih Kesempatan ujian</Label>
        <Select
          name="attempt"
          value={selectedAttempt}
          onValueChange={(value) => setSelectedAttempt(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih area pabrik" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>Daftar Kesempatan Ujian</SelectLabel>
              {attempts.map((item) => (
                <SelectItem key={item.attempt} value={item.attempt.toString()}>
                  {item.description}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-4">
        <SubmissionList numberAttempt={Number(selectedAttempt)} />
      </div>
    </div>
  );
}

function SubmissionList({ numberAttempt }: { numberAttempt: number }) {
  const { id } = useParams<{ id: string }>();
  const {
    data: submission,
    isLoading,
    error,
  } = useSWR([id, numberAttempt], () =>
    getSubmissionSummary(id, numberAttempt),
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorComp error="Gagal mendapatkan daftar jawaban peserta." />;
  }

  if (!submission || "error" in submission) {
    return <ErrorComp error="Gagal mendapatkan daftar jawaban peserta." />;
  }

  if (submission.length === 0) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        <p>Belum ada data.</p>
      </div>
    );
  }

  return submission?.map((submission, index) => {
    return (
      <div key={submission.examName} className="space-y-2">
        <p className="text-lg font-medium">
          {index + 1}. {submission.examName}
        </p>
        {submission.submission.map((data, index) => {
          return (
            <UserAnswerListItem
              key={index}
              participantName={data.participantName}
              listCodeValue={data.list}
              note={data.note}
            />
          );
        })}
      </div>
    );
  });
}

function UserAnswerListItem({
  participantName,
  listCodeValue,
  note,
}: {
  participantName: string;
  listCodeValue: {
    code: string;
    value: string;
    addValue: string | null;
    result: string;
    additionalResult: string | null;
  }[];
  note: string | null;
}) {
  return (
    <div className="p-2 rounded-md border min-w-0">
      <p className="wrap-break-words">{participantName}</p>
      <div className="flex gap-2 overflow-x-auto">
        {listCodeValue.map((item, index) => (
          <UserAnswerCodeValueItem
            key={index}
            code={item.code}
            value={item.value}
            addValue={item.addValue}
            result={item.result}
            additionalResult={item.additionalResult}
          />
        ))}
        {note && (
          <div className="border-l-4 border-l-orange-300 border border-orange-200 text-sm px-3 py-1">
            {note}
          </div>
        )}
      </div>
    </div>
  );
}

function UserAnswerCodeValueItem({
  code,
  value,
  addValue,
  result,
  additionalResult,
}: {
  code: string;
  value: string;
  addValue: string | null;
  result: string;
  additionalResult: string | null;
}) {
  const headerValue = `${value} ${addValue ?? ""}`;

  return (
    <div
      className={`min-w-30 shrink-0 border rounded-md text-sm ${result === "wrong" ? "bg-red-200" : (result === "correct" && additionalResult === "wrong") || result === "partial" ? "bg-orange-200" : ""}`}
    >
      <p className="px-3 pt-2 pb-1 bg-muted font-medium text-center">
        {headerValue.trim() ? headerValue : "tidak diisi"}
      </p>
      <Separator />
      <p className="px-3 py-1 text-center">{code ? code : "tidak diisi"}</p>
    </div>
  );
}
