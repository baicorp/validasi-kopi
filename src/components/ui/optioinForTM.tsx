"use client";

import { Label } from "./label";
import { Input } from "./input";
import { Button } from "./button";
import { Plus, X } from "lucide-react";
import { listTresholdSingleValue } from "@/lib/constant";
import { Dispatch, SetStateAction, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";

export default function OptionForTresholdMix() {
  const [tresholdMixValues, setTresholdMixValues] = useState<string[]>([]);
  const [firstValue, setFirstValue] = useState("");
  const [secondValue, setSecondValue] = useState("");

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="font-medium">
          Kombinasi Treshold Mix ({tresholdMixValues.length} / 5)
        </Label>
        <span className="block text-sm text-muted-foreground">
          Masukkan 5 kombinasi rasa untuk nilai Treshold Mix.
        </span>
      </div>
      <div>
        <div className="flex gap-2 items-center lg:w-1/2">
          <SelectTasteInten
            selectedTasteIntent={firstValue}
            setSelectedTasteIntent={setFirstValue}
            disabled={tresholdMixValues.length === 5}
          />
          <Plus />
          <SelectTasteInten
            selectedTasteIntent={secondValue}
            setSelectedTasteIntent={setSecondValue}
            disabled={tresholdMixValues.length === 5}
          />
          <Button
            variant={"secondary"}
            disabled={tresholdMixValues.length === 5}
            onClick={(e) => {
              e.preventDefault();
              const firstVal = firstValue.trim();
              const secondVal = secondValue.trim();
              if (!firstVal || !secondVal) return;
              setFirstValue("");
              setSecondValue("");
              setTresholdMixValues((prev) => [
                ...prev,
                `${firstVal}&${secondVal}`,
              ]);
            }}
          >
            Tambah
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <ThresholdMixValues
            tresholdMixValues={tresholdMixValues}
            setTresholdMixValues={setTresholdMixValues}
          />
        </div>
      </div>
    </div>
  );
}

function ThresholdMixValues({
  tresholdMixValues,
  setTresholdMixValues,
}: {
  tresholdMixValues: string[];
  setTresholdMixValues: React.Dispatch<SetStateAction<string[]>>;
}) {
  return tresholdMixValues.map((value, index) => {
    return (
      <div
        key={index}
        className="px-2.5 py-1.5 border rounded-md flex items-center gap-2 bg-green-100 ring-1 ring-green-600"
      >
        <Input
          // IMPORTANT: ensure this name matches basicExam in constant.ts
          // replace all space with "-" and end with "-values"
          name="treshold-mix-values"
          value={value}
          readOnly
          hidden
        />
        <p className="text-sm">
          {value.replaceAll("+", " ").replace("&", " + ")}
        </p>
        <X
          className="w-4 h-4 cursor-pointer"
          onClick={() => {
            setTresholdMixValues((prev) =>
              prev.filter((data) => data !== value),
            );
          }}
        />
      </div>
    );
  });
}

function SelectTasteInten({
  selectedTasteIntent,
  setSelectedTasteIntent,
  disabled,
}: {
  selectedTasteIntent: string;
  setSelectedTasteIntent: Dispatch<SetStateAction<string>>;
  disabled: boolean;
}) {
  const data = [...listTresholdSingleValue];

  return (
    <Select
      value={selectedTasteIntent}
      onValueChange={setSelectedTasteIntent}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih Rasa" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Daftar Rasa</SelectLabel>
          {data.map((value, index) => (
            <SelectItem key={index} value={value.tasteIntent}>
              {value.tasteIntent.replace("+", " ")}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
