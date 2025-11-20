"use client";

import { toast } from "sonner";
import { Label } from "./label";
import { useState } from "react";
import { toTitleCase } from "@/lib/utils";
import { listTresholdSingleValue, TasteWithIntensity } from "@/lib/constant";

export default function OptionForTresholdSingle() {
  const [selectedValues, setSelectedValues] = useState<TasteWithIntensity[]>(
    [],
  );

  // Helpers
  const getBaseTaste = (x: string) => x.split("+")[0];
  const getIntensity = (x: string) =>
    x.includes("+") ? Number(x.split("+")[1]) : null;

  const buildTasteIntent = (base: string, intensity: number | null) =>
    intensity ? `${base}+${intensity}` : base;

  const isSelected = (obj: TasteWithIntensity) =>
    selectedValues.some((b) => b.tasteIntent === obj.tasteIntent);

  const handleClick = (obj: TasteWithIntensity) => {
    const base = getBaseTaste(obj.tasteIntent);
    const intensity = getIntensity(obj.tasteIntent);

    const selected = isSelected(obj);

    if (selected) {
      if (intensity) {
        setSelectedValues(
          selectedValues.filter((b) => {
            const bBase = getBaseTaste(b.tasteIntent);
            const bInt = getIntensity(b.tasteIntent);

            if (bBase !== base) return true; // different taste, keep

            // remove same or higher intensities
            return !(bInt !== null && intensity !== null && bInt >= intensity);
          }),
        );
      } else {
        setSelectedValues(
          selectedValues.filter((b) => b.tasteIntent !== obj.tasteIntent),
        );
      }
      return;
    }

    if (intensity && intensity > 1) {
      const requiredLowerIntent = buildTasteIntent(base, intensity - 1);

      if (!selectedValues.some((x) => x.tasteIntent === requiredLowerIntent)) {
        toast.info(
          "Harus memilih intensitas yang lebih rendah terlebih dahulu.",
        );
        return;
      }
    }

    if (selectedValues.length >= 12) return;

    setSelectedValues([...selectedValues, obj]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="font-medium">
          Pilih Treshold Single ({selectedValues.length} / 12)
        </Label>
        <span className="block text-sm text-muted-foreground">
          Pilih 12 rasa.
        </span>
      </div>

      <ul className="grid grid-cols-3 gap-1.5">
        {listTresholdSingleValue.map((item, idx) => {
          const selected = isSelected(item);
          return (
            <li
              key={idx}
              onClick={() => handleClick(item)}
              className={`p-2 text-black text-sm rounded-sm border cursor-pointer transition
                ${
                  selected
                    ? "ring-1 ring-green-600 bg-green-100"
                    : "border-green-400 hover:bg-green-50"
                }`}
            >
              {toTitleCase(
                item.tasteIntent.replaceAll("+", " ").replace("&", " + "),
              )}
            </li>
          );
        })}
      </ul>

      {/* Hidden inputs for form submit */}
      {selectedValues.map((data, index) => (
        <input
          key={index}
          type="hidden"
          // IMPORTANT: ensure this name matches basicExam in constant.ts
          // replace all space with "-" and end with "-values"
          name="treshold-single-values"
          value={data.tasteIntent}
        />
      ))}
    </div>
  );
}
