"use client";

import { toast } from "sonner";
import { Label } from "./label";
import { useState } from "react";
import { toTitleCase } from "@/lib/utils";
import { listTresholdSingleValue, TasteWithIntensity } from "@/lib/constant";

export default function OptionForTresholdSingle() {
  const [tresholdSingleValues, setTresholdSingleValues] = useState<
    TasteWithIntensity[]
  >([]);

  const isSelected = (object: TasteWithIntensity) =>
    tresholdSingleValues.some(
      (b) => b.taste === object.taste && b.intensity === object.intensity,
    );

  const handleClick = (object: TasteWithIntensity) => {
    if (isSelected(object)) {
      if (object.intensity === undefined) {
        setTresholdSingleValues(
          tresholdSingleValues.filter((b) => !(b.intensity === undefined)),
        );
      } else {
        setTresholdSingleValues(
          tresholdSingleValues.filter(
            (b) =>
              !(b.taste === object.taste && b.intensity! >= object.intensity!),
          ),
        );
      }
    } else {
      if (object.intensity !== undefined && object.intensity > 1) {
        const availablebefore = tresholdSingleValues.some(
          (bd) =>
            bd.taste === object.taste && object.intensity! - 1 === bd.intensity,
        );
        if (!availablebefore) {
          toast.info(
            "Harus memilih intensitas yang lebih rendah terlebih dahulu.",
          );
          return;
        }
      }
      // select 12 tastes from the list
      if (tresholdSingleValues.length === 12) return;
      setTresholdSingleValues([...tresholdSingleValues, object]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="font-medium">
          Pilih Treshold Single ({tresholdSingleValues.length} / 12)
        </Label>
        <span className="block text-sm text-muted-foreground">
          Pilih 12 rasa.
        </span>
      </div>
      <ul className="grid grid-cols-3 gap-1.5">
        {listTresholdSingleValue.map((item, idx) => {
          const selectedState = isSelected(item as TasteWithIntensity);
          return (
            <li
              key={idx}
              onClick={() => handleClick(item as TasteWithIntensity)}
              className={`p-2 text-black text-sm rounded-sm border transition ${
                selectedState
                  ? "ring-1 ring-green-600 bg-green-100"
                  : "border-green-400 hover:bg-green-50"
              }`}
            >
              {toTitleCase(item.taste)}
              {item.intensity > 0 ? ` ${item.intensity}` : ""}
            </li>
          );
        })}
      </ul>
      {tresholdSingleValues.map((data, index) => (
        <input
          key={index}
          type="hidden"
          // IMPORTANT: ensure this name matches basicExam in constant.ts
          // replace all space with "-" and end with "-values"
          name="treshold-single-values"
          value={`${data.taste}${data?.intensity > 0 ? "+" + data.intensity : ""}`}
        />
      ))}
    </div>
  );
}
