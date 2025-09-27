"use client";

import { export_data } from "@/exportSheet";
import { Button } from "./button";
import { Separator } from "./separator";
import TableBlock from "../table/tableBlock";
import { memo } from "react";
import SaveToDatabaseButton from "./saveTableToDB";
import { SoalUjiClientStructure } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";

const DataViewer = memo(function DataViewer({
  jenisUji,
  variant = "viewer",
  generatedCodeData,
}: {
  jenisUji: string;
  variant?: "viewer" | "saver";
  generatedCodeData: SoalUjiClientStructure[];
}) {
  return (
    <>
      <Separator className="my-6" />
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-lg">
            Table Soal {toTitleCase(jenisUji)}
          </p>
          <div className="flex gap-2">
            <Button
              variant={"outline"}
              onClick={() => export_data(generatedCodeData, jenisUji)}
            >
              Export Table
            </Button>
            {variant === "saver" && (
              <SaveToDatabaseButton
                jenisUji={jenisUji}
                soal={generatedCodeData}
              />
            )}
          </div>
        </div>
        {generatedCodeData.map((data, index) => (
          <TableBlock
            key={index}
            namaTabel={`${index + 1}. ${data.tipeUjian}`}
            dataTabel={data.soal}
            totalKode={data.totalKode}
          />
        ))}
      </section>
    </>
  );
});

export default DataViewer;
