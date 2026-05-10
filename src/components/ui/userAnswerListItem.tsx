"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
import useSWR from "swr";
import ErrorComp from "./error";
import { Label } from "./label";
import Loading from "../skeleton/loading";
import { useParams } from "next/navigation";
import { ChartColumnBig, NotebookText } from "lucide-react";
import { cn, toTitleCase } from "@/lib/utils";
import { getSubmissionSummary } from "@/actions/examSubmissions";

const numberAttempts = [
  { attempt: 1, description: "Ujian Reguler" },
  { attempt: 2, description: "Ujian Mengulang 1" },
  { attempt: 3, description: "Ujian Mengulang 2" },
  { attempt: 4, description: "Ujian Mengulang 3" },
];

const resultStyle = {
  wrong: {
    container: "bg-red-100 border-[#fecaca]",
    title: "text-[#dc2626]",
    code: "text-[#991b1b]",
  },
  partial: {
    container: "bg-orange-100 border-[#fed7aa]",
    title: "text-[#c2410c]",
    code: "text-[#9a3412]",
  },
  correct: {
    container: "bg-green-100 border-[#bbf7d0]",
    title: "text-[#15803d]",
    code: "text-[#166534]",
  },
};

const status: Record<string, { className: string; description: string }> = {
  wrong: {
    className: "bg-red-100 border-[#fecaca] text-[#dc2626]",
    description: "Salah",
  },
  correct: {
    className: "bg-green-100 border-[#bbf7d0] text-[#15803d]",
    description: "Benar",
  },
  partial: {
    className: "bg-orange-100 border-[#fed7aa] text-[#c2410c]",
    description: "Sebagian salah",
  },
};

export default function UserAnswerList() {
  const [selectedAttempt, setSelectedAttempt] = useState(
    numberAttempts[0].attempt.toString(),
  );

  return (
    <div>
      <div className="flex border-b">
        <div className="w-fit pr-10 border-r space-y-2 pb-4">
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
                {numberAttempts.map((item) => (
                  <SelectItem
                    key={item.attempt}
                    value={item.attempt.toString()}
                  >
                    {item.description}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 px-10">
          <label>Keterangan : </label>
          <div className="flex gap-2">
            <ColorDescription variant={"correct"} />
            <ColorDescription variant={"wrong"} />
            <ColorDescription variant={"partial"} />
          </div>
        </div>
      </div>
      <SubmissionList numberAttempt={Number(selectedAttempt)} />
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
      <div key={submission.examName} className="py-4 flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <div className="shrink-0 w-7 h-7 grid place-items-center rounded-full bg-black text-white font-bold">
            {index + 1}
          </div>
          <p className="text-lg tracking-wide font-medium">
            {toTitleCase(submission.examName)}
          </p>
        </div>
        {submission.submission.map((data) => {
          return (
            <UserAnswerListItem
              key={data.participantName}
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
  const numberOfPartial = listCodeValue.filter(
    (data) =>
      (data.result === "correct" && data.additionalResult === "wrong") ||
      data.result === "partial",
  ).length;
  const numberOfWrong = listCodeValue.filter(
    (data) => data.result === "wrong",
  ).length;
  const numberOfCorrect = listCodeValue.filter(
    (data) => data.result === "correct" && data.additionalResult !== "wrong",
  ).length;

  const stat = [
    numberOfCorrect > 0 ? `${numberOfCorrect} benar` : null,
    numberOfPartial > 0 ? `${numberOfPartial} salah sebagian` : null,
    numberOfWrong > 0 ? `${numberOfWrong} salah` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex justify-between px-3 py-2 bg-secondary border-b">
        <p className="wrap-break-words tracking-wider font-semibold text-sm line-clamp-2 text-ellipsis">
          {participantName}
        </p>
        <div className="flex items-center gap-1 tracking-wider font-semibold text-xs text-muted-foreground">
          <ChartColumnBig size={14} />
          <span>{stat}</span>
        </div>
      </div>
      <div className="p-2 grid grid-cols-6 gap-2">
        {listCodeValue.map((item) => (
          <UserAnswerCodeValueItem
            key={item.code}
            code={item.code}
            value={item.value}
            addValue={item.addValue}
            result={item.result}
            additionalResult={item.additionalResult}
          />
        ))}
      </div>
      {note && <UserExamNote note={note} />}
    </div>
  );
}

function UserExamNote({ note }: { note: string }) {
  return (
    <div className="flex gap-2 px-2.5 py-2 bg-[#fffbeb] text-[#78350f] border-t border-[#fde68a]">
      <NotebookText size={16} className="shrink-0" />
      <p className="text-sm leading-tight tracking-wide">{note}</p>
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

  const variant =
    result === "wrong"
      ? "wrong"
      : (result === "correct" && additionalResult === "wrong") ||
          result === "partial"
        ? "partial"
        : "correct";

  const style = resultStyle[variant];

  return (
    <div className={`px-3 py-1.5 border rounded-md ${style.container}`}>
      <p
        className={`font-medium tracking-wider text-xs text-center ${style.title}`}
      >
        {headerValue.trim() ? headerValue : "tidak diisi"}
      </p>
      <p className={`text-center font-semibold font-mono ${style.code}`}>
        {code ? code : "tidak diisi"}
      </p>
    </div>
  );
}

function ColorDescription({
  variant,
}: {
  variant: "wrong" | "correct" | "partial";
}) {
  return (
    <div className="flex gap-2 items-center">
      <div
        className={cn(
          "w-4 h-4 border-2 rounded-sm shrink-0",
          status[variant].className,
        )}
      ></div>
      <p>{status[variant].description}</p>
    </div>
  );
}
