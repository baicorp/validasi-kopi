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
import { cn } from "@/lib/utils";
import { Label } from "./label";
import Loading from "../skeleton/loading";
import { useParams } from "next/navigation";
import { ChartColumnBig, NotebookText } from "lucide-react";
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
      <div className="flex border-b mb-2">
        <div className="w-fit pr-10 border-r space-y-2 pb-2.5">
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
  const { examEventId } = useParams<{ examEventId: string }>();
  const {
    data: submission,
    isLoading,
    error,
  } = useSWR([examEventId, numberAttempt], () =>
    getSubmissionSummary(examEventId, numberAttempt),
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

  if (submission.size === 0) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        <p>Belum ada data.</p>
      </div>
    );
  }

  return (
    <>
      {[...submission.entries()].map(([participantName, value], index) => {
        return (
          <div key={index} className="rounded-md border mb-2">
            <div className="flex items-center gap-2 bg-secondary px-3 py-2">
              <span className="shrink-0 w-6 h-6 text-sm grid place-items-center rounded-full bg-black text-white font-bold">
                {index + 1}
              </span>
              <p className="font-semibold">{participantName.split("&&")[0]}</p>
              <p className="ml-auto font-medium text-sm text-muted-foreground">
                {participantName.split("&&")[1]}
              </p>
            </div>
            <div className="divide-y px-3">
              {[...value.entries()]
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([examName, answerList]) => {
                  return (
                    <UserAnswerListItem
                      key={examName}
                      examName={examName}
                      listCodeValue={[...answerList].sort((a, b) =>
                        (a.value + ` ${a.addValue}`).localeCompare(
                          b.value + ` ${b.addValue}`,
                        ),
                      )}
                    />
                  );
                })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function UserAnswerListItem({
  examName,
  listCodeValue,
}: {
  examName: string;
  listCodeValue: {
    code: string;
    value: string;
    result: string;
    additionalResult: string | null;
    addValue: string | null;
    note: string | null;
  }[];
}) {
  let totalCorrect = 0;
  let totalPartial = 0;
  let totalWrong = 0;
  for (const data of listCodeValue) {
    if (
      (data.result === "correct" && data.additionalResult === "wrong") ||
      data.result === "partial"
    ) {
      totalPartial++;
    } else if (data.result === "wrong") {
      totalWrong++;
    } else if (data.result === "correct" && data.additionalResult !== "wrong") {
      totalCorrect++;
    }
  }
  const stat = [
    totalCorrect > 0 ? `${totalCorrect} benar` : null,
    totalPartial > 0 ? `${totalPartial} salah sebagian` : null,
    totalWrong > 0 ? `${totalWrong} salah` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <section className="pb-2">
      <div className="flex justify-between px-3 py-0.5">
        <p className="wrap-break-words tracking-wider font-semibold text-sm line-clamp-2 text-ellipsis">
          {examName}
        </p>
        <div className="flex items-center gap-1 tracking-wider font-semibold text-xs text-muted-foreground">
          <ChartColumnBig size={14} />
          <span>{stat}</span>
        </div>
      </div>
      <div className="grid grid-cols-6 gap-2">
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
      {listCodeValue[0].note && <UserExamNote note={listCodeValue[0].note} />}
    </section>
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
    <div className={`px-3 py-1 border rounded-md ${style.container}`}>
      <p
        title={headerValue.trim()}
        className={`line-clamp-1 text-ellipsis font-medium tracking-wider text-xs text-center ${style.title}`}
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
