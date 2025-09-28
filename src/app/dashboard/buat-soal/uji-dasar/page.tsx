"use client";

import { toast } from "sonner";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UjiDasar } from "@/lib/uji/codeGenerator";
import { Checkbox } from "@/components/ui/checkbox";
import DataViewer from "@/components/ui/dataViewer";
import { SoalUjiClientStructure } from "@/lib/types";
import PilihanTresholdMix from "@/components/ui/pilihanTM";
import PilihanTresholdSingle from "@/components/ui/pilihanTS";

export default function Page() {
  const [soalUjiDasar, setSoalUjiDasar] = useState<SoalUjiClientStructure[]>(
    [],
  );

  function handleGenerateUjiDasar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tresholdSingle = formData.getAll("rasa-single");
    const tresholdMix = formData.getAll("rasa-mix");
    const jumlahPeserta = formData.get("jumlah-peserta") as string;
    const isIncludeTwoOutOfFivePure = formData.get("include-pure") as string;
    const jumlah = Number(jumlahPeserta);

    if (tresholdSingle.length !== 12 || tresholdMix.length !== 5) {
      toast.error("Lengkapi data sesuai petunjuk.");
      return;
    }

    if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > 200) {
      toast.error(`Jumlah peserta minimal 1 dan maksimal 200 orang`);
      return;
    }

    const kode = new UjiDasar(
      tresholdSingle.map((nilai) => nilai.toString().trim()),
      tresholdMix.map((nilai) => nilai.toString().trim()),
      Boolean(isIncludeTwoOutOfFivePure),
      jumlah,
    );

    const soalUjiDasar = kode.buatKodeUjiDasar();
    setSoalUjiDasar(soalUjiDasar);
  }

  return (
    <>
      <section>
        <p className="text-lg font-semibold mb-4">Buat Soal Uji Dasar</p>
        <form onSubmit={handleGenerateUjiDasar} className="flex flex-col gap-6">
          <IncludePure />
          <PilihanTresholdSingle />
          <PilihanTresholdMix />
          <div className="flex flex-col gap-2">
            <div>
              <Label htmlFor="jumlah-peserta" className="font-medium">
                Masukkan jumlah peserta
              </Label>
              <span className="block text-sm text-muted-foreground">
                Peserta minimal 1 dan maksimal 200
              </span>
            </div>
            <Input
              type="number"
              id="jumlah-peserta"
              name="jumlah-peserta"
              min={1}
              placeholder="Minimal 1 peserta"
            />
          </div>
          <Button type="submit">Buat Soal Uji Dasar</Button>
        </form>
      </section>
      {soalUjiDasar.length !== 0 && (
        <DataViewer
          variant="saver"
          jenisUji="Uji Dasar"
          generatedCodeData={soalUjiDasar}
        />
      )}
    </>
  );
}

function IncludePure() {
  const [listTerpilih, setListTerpilih] = useState<string[]>([]);

  const handleChange = (rasaDipilih: string) => {
    setListTerpilih((prev) => {
      const updated = prev.includes(rasaDipilih)
        ? prev.filter((rasa) => rasa !== rasaDipilih)
        : [...prev, rasaDipilih];
      return updated;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="font-medium">Tambahan Uji 2 Out of 5 Pure</Label>
        <span className="block text-sm text-muted-foreground">
          Pilih jika ingin menambahkan 2 Out Of 5 Pure
        </span>
      </div>
      <div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="pure"
            checked={listTerpilih.includes("pure")}
            onCheckedChange={() => handleChange("pure")}
          />
          <Label htmlFor="pure">2 Out Of 5 Pure</Label>
          {listTerpilih.includes("pure") && (
            <input type="hidden" name="include-pure" value="true" />
          )}
        </div>
      </div>
    </div>
  );
}
