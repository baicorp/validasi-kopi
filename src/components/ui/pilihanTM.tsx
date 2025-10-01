"use client";

import useSWR from "swr";
import { Label } from "./label";
import { Checkbox } from "./checkbox";
import { Card, CardContent } from "./card";
import { SetStateAction, useState } from "react";
import { getAllRasaMix } from "@/actions/rasaMix";

export default function PilihanTresholdMix() {
  const [listTerpilih, setListTerpilih] = useState<string[]>([]);

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
            <ListRasa
              listTerpilih={listTerpilih}
              setListTerpilih={setListTerpilih}
            />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function ListRasa({
  listTerpilih,
  setListTerpilih,
}: {
  listTerpilih: string[];
  setListTerpilih: React.Dispatch<SetStateAction<string[]>>;
}) {
  const {
    data: listRasa,
    isLoading,
    error,
  } = useSWR("listRasaMix", getAllRasaMix);

  const handleChange = (rasaDipilih: string) => {
    setListTerpilih((prev) =>
      listTerpilih.includes(rasaDipilih)
        ? prev.filter((rasa) => rasa !== rasaDipilih)
        : [...prev, rasaDipilih],
    );
  };

  if (isLoading) return <ListRasaSkeleton />;

  if (error)
    return <p className="text-muted-foreground">Gagal mendapatkan data.</p>;

  return listRasa?.map((row) => {
    const checked = listTerpilih.includes(row.rasaMix);
    const disabled = !checked && listTerpilih.length >= 5; // maksimal memilih 5

    return (
      <li key={row.id} className="flex items-center gap-2">
        <Checkbox
          id={row.rasaMix}
          checked={checked}
          disabled={disabled}
          onCheckedChange={() => handleChange(row.rasaMix)}
        />
        <Label htmlFor={row.rasaMix}>{row.rasaMix}</Label>
        {checked && <input type="hidden" name="rasa-mix" value={row.rasaMix} />}
      </li>
    );
  });
}

function ListRasaSkeleton() {
  return [1, 2, 3].map((data) => (
    <li key={data} className="flex items-center gap-2">
      <Checkbox />
      <span className="h-2.5 w-52 animate-pulse bg-accent" />
    </li>
  ));
}
