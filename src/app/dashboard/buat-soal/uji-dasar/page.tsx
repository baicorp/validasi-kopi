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
import { toTitleCase } from "@/lib/utils";

export default function Page() {
  const [soalUjiDasar, setSoalUjiDasar] = useState<SoalUjiClientStructure[]>(
    [],
  );

  function handleGenerateUjiDasar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const nilaiTwoOutOfFiveCampuranKopi = formData.getAll(
      "two-out-of-five-campuran-kopi",
    ) as string[];
    const nilaiTwoOutOfFiveKopiPure = formData.getAll(
      "two-out-of-five-kopi-pure",
    ) as string[];
    const tresholdSingle = formData.getAll("rasa-single");
    const tresholdMix = formData.getAll("rasa-mix");
    const jumlahPeserta = formData.get("jumlah-peserta") as string;
    const jumlah = Number(jumlahPeserta);

    if (
      nilaiTwoOutOfFiveCampuranKopi.length < 4 ||
      tresholdSingle.length !== 12 ||
      tresholdMix.length !== 5
    ) {
      toast.error("Lengkapi data sesuai petunjuk.");
      return;
    }

    if (
      nilaiTwoOutOfFiveKopiPure.length !== 0 &&
      nilaiTwoOutOfFiveKopiPure.length < 4
    ) {
      toast.error("Lengkapi data sesuai petunjuk.");
      return;
    }

    if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > 200) {
      toast.error(`Jumlah peserta minimal 1 dan maksimal 200 orang`);
      return;
    }

    const kode = new UjiDasar({
      nilaiTwoOutOfFiveCampuranKopi: nilaiTwoOutOfFiveCampuranKopi,
      nilaiTwoOutOfFiveKopiPure: nilaiTwoOutOfFiveKopiPure,
      nilaiTresholdSingle: tresholdSingle.map((nilai) =>
        nilai.toString().trim(),
      ),
      nilaiTresholdMix: tresholdMix.map((nilai) => nilai.toString().trim()),
      jumlahPesertaUjian: jumlah,
    });

    const soalUjiDasar = kode.buatKodeUjiDasar();
    setSoalUjiDasar(soalUjiDasar);
  }

  return (
    <>
      <section>
        <p className="text-lg font-semibold mb-4">Buat Soal Uji Dasar</p>
        <form onSubmit={handleGenerateUjiDasar} className="flex flex-col gap-6">
          {/*<IncludePure />*/}
          <TwoOutOfFive variant="campuran kopi" />
          <TwoOutOfFive variant="kopi pure" />
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

function TwoOutOfFive({ variant }: { variant: "campuran kopi" | "kopi pure" }) {
  const variantForName = variant.split(" ").join("-");

  const [isPureInclude, setIsPureInclude] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="flex items-center gap-2">
          {variant === "kopi pure" && (
            <Checkbox
              checked={isPureInclude}
              id="include-pure"
              onCheckedChange={() => setIsPureInclude((prev) => !prev)}
            />
          )}
          <Label
            className="font-medium"
            htmlFor={variant === "kopi pure" ? "include-pure" : ""}
          >
            2 Out of 5 {toTitleCase(variant)}
          </Label>
        </div>
        <span className="block text-sm text-muted-foreground mt-1">
          {variant === "kopi pure" && !isPureInclude
            ? "Checklist jika ingin menambahkan 2 out of 5 pure."
            : `Masukkan produk ${variant} untuk 2 Out Of 5.`}
        </span>
      </div>
      <div>
        <div className="flex flex-col gap-1.5">
          {variant === "kopi pure" &&
            isPureInclude &&
            ["sama", "beda 1", "beda 2", "beda 3"].map((nilai, index) => {
              return (
                <Input
                  key={index}
                  name={`two-out-of-five-${variantForName}`}
                  placeholder={`Produk untuk nilai ${nilai}`}
                  required
                />
              );
            })}
          {variant === "campuran kopi" &&
            ["sama", "beda 1", "beda 2", "beda 3"].map((nilai, index) => {
              return (
                <Input
                  key={index}
                  name={`two-out-of-five-${variantForName}`}
                  placeholder={`Produk untuk nilai ${nilai}`}
                  required
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
