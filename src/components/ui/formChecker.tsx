"use client";

import { Button } from "./button";
import { FormEvent, useEffect, useState } from "react";
import { codeCheck, toTitleCase, transformDataFromDB } from "@/lib/utils";
import { SoalUjiClientStructure, SoalUjiDBStructureRead } from "@/lib/types";
import { toast } from "sonner";

export default function FormChecker({
  dataSoal,
}: {
  dataSoal: SoalUjiDBStructureRead[];
}) {
  const soal = transformDataFromDB(dataSoal);
  const [listKodeSalah, setListKodeSalah] = useState<string[]>([]);
  const [listKodeSalahSebagian, setListKodeSalahSebagian] = useState<string[]>(
    [],
  );
  const [reset, setReset] = useState(false);

  function handleCheck(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const entries: Record<string, FormDataEntryValue[]> = {};

    for (const [key, value] of formData.entries()) {
      if (entries[key]) {
        entries[key].push(value);
      } else {
        entries[key] = [value];
      }
    }

    const listKode = Object.values(entries).flat();
    if (new Set(listKode).size !== listKode.length) {
      toast.error("Setiap kode yang dimasukkan harus berbeda.");
      return;
    }

    const kodeSalah: string[] = [];
    const salahSebagian: string[] = [];

    Object.keys(entries).forEach((key) => {
      entries[key].map((kode) => {
        kode = kode as string;
        const result = codeCheck(kode, key, dataSoal);
        if (result === "salah") {
          kodeSalah.push(kode);
        } else if (result === "salah-sebagian") {
          salahSebagian.push(kode);
        }
      });
    });

    setListKodeSalah(kodeSalah);
    setListKodeSalahSebagian(salahSebagian);
  }

  return (
    <form onSubmit={handleCheck}>
      <div className="flex flex-col gap-4">
        {soal.map((data, index) => {
          return (
            <DynamicComponent
              key={index}
              obj={data}
              triggerReset={reset}
              wrongCodes={listKodeSalah}
              halfWrongCodes={listKodeSalahSebagian}
            />
          );
        })}
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          type="reset"
          variant={"outline"}
          onClick={() => {
            setListKodeSalah([]);
            setListKodeSalahSebagian([]);
            setReset((prev) => !prev);
          }}
        >
          Bersihkan
        </Button>
        <Button type="submit">Cek Jawaban</Button>
      </div>
    </form>
  );
}

function DynamicComponent({
  triggerReset,
  halfWrongCodes,
  wrongCodes,
  obj,
}: {
  triggerReset: boolean;
  halfWrongCodes: string[];
  wrongCodes: string[];
  obj: SoalUjiClientStructure;
}) {
  return (
    <div>
      <p className="font-medium mb-2">{toTitleCase(obj.tipeUjian)}</p>
      <div className="grid grid-cols-6 gap-2">
        {obj.soal.map((data) => {
          return Object.keys(data).map((nilaiKode) => (
            <div
              key={nilaiKode}
              className="bg-card text-card-foreground shadow-sm border rounded-lg p-1 flex flex-col justify-between"
            >
              <p className="p-2 font-medium text-center">{nilaiKode}</p>
              <div className="flex flex-col gap-1">
                <DynamicInput
                  halfWrongCodes={halfWrongCodes}
                  triggerReset={triggerReset}
                  nilaiKode={nilaiKode}
                  wrongCodes={wrongCodes}
                />
                {nilaiKode === "beda" &&
                  obj.tipeUjian.toLowerCase() === "2 out of 5" && (
                    <>
                      <DynamicInput
                        halfWrongCodes={halfWrongCodes}
                        triggerReset={triggerReset}
                        nilaiKode={nilaiKode}
                        wrongCodes={wrongCodes}
                      />
                      <DynamicInput
                        halfWrongCodes={halfWrongCodes}
                        triggerReset={triggerReset}
                        nilaiKode={nilaiKode}
                        wrongCodes={wrongCodes}
                      />
                    </>
                  )}
                {nilaiKode === "sama" && (
                  <>
                    <DynamicInput
                      halfWrongCodes={halfWrongCodes}
                      triggerReset={triggerReset}
                      nilaiKode={nilaiKode}
                      wrongCodes={wrongCodes}
                    />
                  </>
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
  nilaiKode,
}: {
  triggerReset: boolean;
  halfWrongCodes: string[];
  wrongCodes: string[];
  nilaiKode: string;
}) {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    setValue("");
  }, [triggerReset]);

  return (
    <input
      name={nilaiKode}
      type="number"
      placeholder="Kode"
      max={9999}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className={`px-2 py-1 w-full border rounded-md
        ${wrongCodes.includes(value) && !halfWrongCodes.includes(value) ? "ring-2 ring-red-600" : ""}
        ${halfWrongCodes.includes(value) && !wrongCodes.includes(value) ? "ring-2 ring-amber-600" : ""}
        ${wrongCodes.includes(value) && halfWrongCodes.includes(value) ? "ring-2 ring-green-600" : ""}
      `}
    />
  );
}
