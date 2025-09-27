"use client";

import { toast } from "sonner";
import { useState } from "react";
import { listNilaiTresholdSingle, RasaIntensitas } from "@/lib/constant";
import { Label } from "./label";

export default function PilihanTresholdSingle() {
  const [listTerpilih, setListTerpilih] = useState<RasaIntensitas[]>([]);
  const [listRasaTM] = useState(listNilaiTresholdSingle);

  const isSelected = (object: RasaIntensitas) =>
    listTerpilih.some(
      (b) => b.rasa === object.rasa && b.intensitas === object.intensitas,
    );

  const handleClick = (object: RasaIntensitas) => {
    if (isSelected(object)) {
      if (object.intensitas === undefined) {
        setListTerpilih(
          listTerpilih.filter((b) => !(b.intensitas === undefined)),
        );
      } else {
        setListTerpilih(
          listTerpilih.filter(
            (b) =>
              !(b.rasa === object.rasa && b.intensitas! >= object.intensitas!),
          ),
        );
      }
    } else {
      if (object.intensitas !== undefined && object.intensitas > 1) {
        const availablebefore = listTerpilih.some(
          (bd) =>
            bd.rasa === object.rasa && object.intensitas! - 1 === bd.intensitas,
        );
        if (!availablebefore) {
          toast.info(
            "Harus memilih intensitas yang lebih rendah terlebih dahulu",
          );
          return;
        }
      }
      // maksimal memilih 12 rasa intensitas
      if (listTerpilih.length === 12) return;
      setListTerpilih([...listTerpilih, object]);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="font-medium">
          Pilih Treshold Single ({listTerpilih.length} / 12)
        </Label>
        <span className="block text-sm text-muted-foreground">
          Pilih 12 rasa.
        </span>
      </div>
      <ul className="grid grid-cols-3 gap-1.5">
        {listRasaTM.map((rasa, idx) => {
          const selectedState = isSelected(rasa as RasaIntensitas);
          return (
            <li
              key={idx}
              onClick={() => handleClick(rasa as RasaIntensitas)}
              className={`p-2 text-black text-sm rounded-sm border transition ${
                selectedState
                  ? "ring-2 ring-green-600 bg-green-100"
                  : "border-green-400 hover:bg-green-50"
              }`}
            >
              {rasa.rasa}
              {rasa.intensitas ? ` ${rasa.intensitas}` : ""}
            </li>
          );
        })}
      </ul>
      {listTerpilih.map((data, index) => (
        <input
          key={index}
          type="hidden"
          name="rasa-single"
          value={`${data.rasa} ${data?.intensitas ? data.intensitas : ""}`}
        />
      ))}
    </div>
  );
}
