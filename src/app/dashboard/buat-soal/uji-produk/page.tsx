"use client";

import { FormEvent, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useSWR from "swr";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { UjiProduk } from "@/lib/uji/codeGenerator";
import { getAllCategory } from "@/actions/kategory";
import { getProductByCategory } from "@/actions/produk";
import { Card, CardContent } from "@/components/ui/card";
import DataViewer from "@/components/ui/dataViewer";
import { SoalUjiClientStructure } from "@/lib/types";

export default function Page() {
  const [idKategoriProduk, setIdKategoriProduk] = useState("");
  const [soalUjiProduk, setSoalUjiProduk] = useState<SoalUjiClientStructure[]>(
    [],
  );

  function handleGenerateUjiProduk(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const listSelectedProduct = formData.getAll("produk");
    const jumlahPeserta = formData.getAll("jumlah-peserta");

    const listProduk = listSelectedProduct.map((data) => data.toString());
    const jumlah = Number(jumlahPeserta);

    if (listSelectedProduct.length !== 5) {
      toast.error("Harus terdapat 5 produk terpilih.");
      return;
    }

    if (!Number.isInteger(jumlah) || jumlah < 1 || jumlah > 200) {
      toast.error("Jumlah peserta minimal 1 dan maksimal 200 orang.");
      return;
    }

    const kodeSoal = new UjiProduk(listProduk, jumlah);
    const soalUjiProduk = kodeSoal.buatKodeUjiProduk();
    setSoalUjiProduk(soalUjiProduk);
  }

  return (
    <>
      <section>
        <p className="text-lg font-semibold mb-4">Buat Soal Uji Produk</p>
        <form
          className="flex flex-col gap-6"
          onSubmit={handleGenerateUjiProduk}
        >
          <div className="flex flex-col gap-2">
            <div>
              <Label className="font-medium">Pilih kategori produk</Label>
            </div>
            <SelectListKategori setIdKategoriProduk={setIdKategoriProduk} />
          </div>
          <ListProduk idKategoriProduk={idKategoriProduk} />
          <div className="flex flex-col gap-2">
            <div>
              <Label className="font-medium">Masukkan jumlah peserta</Label>
              <span className="block text-sm text-muted-foreground">
                Peserta minimal 1 dan maksimal 200 orang.
              </span>
            </div>
            <Input
              type="number"
              min={1}
              name="jumlah-peserta"
              placeholder="Minimal 1 orang peserta"
            />
          </div>
          <Button type="submit">Buat Soal Uji Produk</Button>
        </form>
      </section>
      {soalUjiProduk.length !== 0 && (
        <DataViewer
          variant="saver"
          jenisUji="Uji Produk"
          generatedCodeData={soalUjiProduk}
        />
      )}
    </>
  );
}

function SelectListKategori({
  setIdKategoriProduk,
}: {
  setIdKategoriProduk: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { data: listKategori, isLoading } = useSWR(
    "listKategori",
    getAllCategory,
  );

  return (
    <Select
      name="kategori-produk"
      onValueChange={(value) => setIdKategoriProduk(value)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Pilih kategori produk" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>kategori</SelectLabel>
          {isLoading ? (
            <SelectItem value="#">Loading...</SelectItem>
          ) : (
            listKategori?.map((kategori, index) => (
              <SelectItem key={index} value={kategori?.id.toString()}>
                {kategori?.kategori}
              </SelectItem>
            ))
          )}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function ListProduk({ idKategoriProduk }: { idKategoriProduk: string }) {
  const { data: listProduct, isLoading } = useSWR(idKategoriProduk, () =>
    getProductByCategory(parseInt(idKategoriProduk)),
  );

  const [listTerpilih, setListTerpilih] = useState<number[]>([]);

  useEffect(() => {
    setListTerpilih([]);
  }, [idKategoriProduk]);

  const toggleSelect = (id: number) => {
    setListTerpilih((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id],
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="font-medium">
          Pilih Porduk ({listTerpilih.length} / 5)
        </Label>
        <span className="block text-sm text-muted-foreground">
          Pilih 5 Produk.
        </span>
      </div>
      {idKategoriProduk ? (
        <Card>
          <CardContent className="">
            <ul className="grid grid-flow-col auto-rows-max grid-rows-5 gap-3">
              {isLoading
                ? [1, 2, 3].map((data) => (
                    <li key={data} className="flex items-center gap-2">
                      <Checkbox />
                      <span className="h-2.5 w-52 animate-pulse bg-accent" />
                    </li>
                  ))
                : listProduct?.map((product) => {
                    const checked = listTerpilih.includes(product.id);
                    const disabled = !checked && listTerpilih.length >= 5; // maksimal memilih 5

                    return (
                      <li key={product.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`produk-${product.id}`}
                          checked={checked}
                          disabled={disabled}
                          onCheckedChange={() => toggleSelect(product.id)}
                        />
                        <Label htmlFor={`produk-${product.id}`}>
                          {product.namaProduk}
                        </Label>
                        {checked && (
                          <input
                            type="hidden"
                            name={"produk"}
                            value={product.namaProduk}
                          />
                        )}
                      </li>
                    );
                  })}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Select disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih kategori produk" />
          </SelectTrigger>
        </Select>
      )}
    </div>
  );
}
