"use client";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { RawExamsData } from "@/lib/types";
import { FormEvent, useEffect, useState } from "react";
import { codeCheck, formatRawExamsData, toTitleCase } from "@/lib/utils";

type FormCheckerProps = {
  rawExamsData: RawExamsData[];
  formatedExamsData: ReturnType<typeof formatRawExamsData>;
};

export default function FormChecker({
  rawExamsData,
  formatedExamsData,
}: FormCheckerProps) {
  const [reset, setReset] = useState(false);
  const [wrongCodes, setWrongCodes] = useState<string[]>([]);
  const [partiallyWrongCodes, setPartiallyWrongCodes] = useState<string[]>([]);

  function handleCheck(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const inputEntries: { code: string; value: string }[] = [];
    const distincCodes = new Set<string>();

    for (const [value, code] of formData.entries()) {
      const strCode = (code as string).trim();
      if (strCode) {
        // only do operation when strCode not empty string
        inputEntries.push({ code: strCode, value });
        if (distincCodes.has(strCode)) {
          toast.error("Kode yang dimasukkan tidak boleh ada yang sama.");
          return;
        }
        distincCodes.add(strCode);
      }
    }

    if (distincCodes.size < 1) {
      toast.error("Setidaknya masukkan 1 kode.");
      return;
    }

    const wrongCodes: string[] = [];
    const partiallyWrongCodes: string[] = [];

    inputEntries.forEach((input) => {
      const result = codeCheck(input.code, input.value, rawExamsData);
      if (result === "wrong") {
        wrongCodes.push(input.code);
      } else if (result === "partially-wrong") {
        partiallyWrongCodes.push(input.code);
      }
    });

    setWrongCodes(wrongCodes);
    setPartiallyWrongCodes(partiallyWrongCodes);
  }

  return (
    <>
      <div className="pb-4 border-b mb-4">
        <p className="font-medium">Indikator pengecekan jawaban</p>
        <div className="flex gap-4">
          <div className="flex gap-1.5 items-center">
            <div className="bg-white border border-muted-foreground w-3.5 h-3.5" />
            <p>Benar</p>
          </div>
          <div className="flex gap-1 items-center">
            <div className="bg-yellow-400 border border-muted-foreground w-3.5 h-3.5" />
            <p>Salah sebagian</p>
          </div>
          <div className="flex gap-1 items-center">
            <div className="bg-red-600 border border-muted-foreground w-3.5 h-3.5" />
            <p>Salah</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleCheck}>
        <div className="flex flex-col gap-4">
          {formatedExamsData.map((examData, index) => {
            return (
              <DynamicComponent
                key={index}
                formatedExamData={examData}
                triggerReset={reset}
                wrongCodes={wrongCodes}
                halfWrongCodes={partiallyWrongCodes}
              />
            );
          })}
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            type="reset"
            variant={"outline"}
            onClick={() => {
              setWrongCodes([]);
              setPartiallyWrongCodes([]);
              setReset((prev) => !prev);
            }}
          >
            Bersihkan
          </Button>
          <Button type="submit">Cek Jawaban</Button>
        </div>
      </form>
    </>
  );
}

function DynamicComponent({
  triggerReset,
  halfWrongCodes,
  wrongCodes,
  formatedExamData,
}: {
  triggerReset: boolean;
  halfWrongCodes: string[];
  wrongCodes: string[];
  formatedExamData: ReturnType<typeof formatRawExamsData>[number];
}) {
  return (
    <div>
      <p className="font-medium mb-2">
        {toTitleCase(formatedExamData.examName)}
      </p>
      <div className="grid grid-cols-6 gap-2">
        {formatedExamData.codeValue.map((exam) => {
          return Object.keys(exam).map((value) => (
            <div
              key={value}
              className="bg-card text-card-foreground shadow-sm border rounded-lg p-1 flex flex-col justify-between"
            >
              <p className="p-2 font-medium text-center">{value}</p>
              <div className="flex flex-col gap-1">
                <DynamicInput
                  halfWrongCodes={halfWrongCodes}
                  triggerReset={triggerReset}
                  codeValue={value}
                  wrongCodes={wrongCodes}
                />
                {value.toLowerCase().includes("sama") && (
                  <DynamicInput
                    halfWrongCodes={halfWrongCodes}
                    triggerReset={triggerReset}
                    codeValue={value}
                    wrongCodes={wrongCodes}
                  />
                )}
              </div>
            </div>
          ));
        })}
      </div>
    </div>
  );
}

function DynamicInput({
  triggerReset,
  halfWrongCodes,
  wrongCodes,
  codeValue,
}: {
  triggerReset: boolean;
  halfWrongCodes: string[];
  wrongCodes: string[];
  codeValue: string;
}) {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setValue("");
  }, [triggerReset]);

  return (
    <input
      name={codeValue}
      type="number"
      placeholder="Kode"
      max={9999}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={`px-2 py-1 w-full border rounded-md
        ${wrongCodes.includes(value) && !halfWrongCodes.includes(value) ? "ring-2 ring-red-600" : ""}
        ${halfWrongCodes.includes(value) && !wrongCodes.includes(value) ? "ring-2 ring-yellow-400" : ""}
      `}
    />
  );
}
