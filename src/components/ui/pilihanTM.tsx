"use client";

import { Label } from "./label";
import { Checkbox } from "./checkbox";
import React, { useState } from "react";
import { Card, CardContent } from "./card";
import { listNilaiTresholdMix } from "@/lib/constant";

export default function PilihanTresholdMix() {
  const [listRasa] = useState(listNilaiTresholdMix);
  const [listTerpilih, setListTerpilih] = useState<string[]>([]);

  const handleChange = (rasaDipilih: string) => {
    setListTerpilih((prev) =>
      listTerpilih.includes(rasaDipilih)
        ? prev.filter((rasa) => rasa !== rasaDipilih)
        : [...prev, rasaDipilih],
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="font-medium">
          Pilih Treshold Mix ({listTerpilih.length} / 5)
        </Label>
        <span className="block text-sm text-muted-foreground">
          Pilih 5 kombinasi rasa.
        </span>
      </div>
      <Card>
        <CardContent>
          <ul className="grid grid-flow-col auto-rows-max grid-rows-5 gap-3">
            {listRasa.map((rasa, idx) => {
              const checked = listTerpilih.includes(rasa);
              const disabled = !checked && listTerpilih.length >= 5; // maksimal memilih 5
              return (
                <li key={idx} className="flex items-center gap-2">
                  <Checkbox
                    id={rasa}
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={() => handleChange(rasa)}
                  />
                  <Label htmlFor={rasa}>{rasa}</Label>
                  {checked && (
                    <input type="hidden" name="rasa-mix" value={rasa} />
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
