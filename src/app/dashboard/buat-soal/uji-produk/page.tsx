"use client";

import useSWR from "swr";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
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
import { toTitleCase } from "@/lib/utils";
import { productExam } from "@/lib/constant";
import { ExamDataDetails } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import ExamDetails from "@/components/ui/examDetail";
import ExamsTable from "@/components/table/examsTable";
import { Card, CardContent } from "@/components/ui/card";
import { generateExamCodes } from "@/lib/handleFormInput";
import { getProductsByCategory } from "@/actions/products";
import InputParticipants from "@/components/ui/inputParticipant";
import { getAllProductCategories } from "@/actions/productCategories";
import ListCheckboxSkeleton from "@/components/skeleton/listCheckboxSkeleton";

export default function Page() {
  const [productCategory, setProductCategoryId] = useState<{
    id: string;
    name: string;
  }>();
  const [examDataDetails, setExamDataDetails] = useState<ExamDataDetails>();

  function handleGenerateCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const examDataDetails = generateExamCodes(
      formData,
      productExam,
      productCategory?.name,
    );

    if ("error" in examDataDetails) {
      toast.error(examDataDetails.error);
      return;
    }

    setExamDataDetails(examDataDetails);
  }

  return (
    <>
      <section className="py-3 bg-background">
        <p className="text-lg font-semibold">Buat Soal Uji Produk</p>
      </section>
      <section>
        <form className="flex flex-col gap-6" onSubmit={handleGenerateCode}>
          <ProductCategories setProductCategoryId={setProductCategoryId} />
          {productCategory && (
            <ListProduk productCategory={productCategory.id} />
          )}
          <InputParticipants />
          <Button type="submit">Buat Soal Uji Produk</Button>
        </form>
      </section>
      {examDataDetails && (
        <>
          <ExamDetails variant="saver" examDataDetails={examDataDetails} />
          <ExamsTable formatedExamsData={examDataDetails.formatedExamsData} />
        </>
      )}
    </>
  );
}

function ProductCategories({
  setProductCategoryId,
}: {
  setProductCategoryId: React.Dispatch<
    React.SetStateAction<{ id: string; name: string } | undefined>
  >;
}) {
  const { data: productCategories, isLoading } = useSWR(
    "productCategories",
    getAllProductCategories,
  );

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="font-medium">
          Pilih kategori produk (Identifikasi)
        </Label>
      </div>
      <Select
        name="kategori-produk"
        required
        onValueChange={(value) => {
          const [id, name] = value.split("+");
          setProductCategoryId({ id, name });
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Pilih kategori produk" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>kategori</SelectLabel>
            {productCategories === undefined || "error" in productCategories ? (
              <p className="text-muted-foreground">
                {productCategories?.error ?? ""}
              </p>
            ) : isLoading ? (
              <SelectItem value="#">Loading...</SelectItem>
            ) : (
              productCategories?.map((category, index) => (
                <SelectItem
                  key={index}
                  value={`${category.id.toString()}+${category.categoryName}`}
                >
                  {category.categoryName}
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

function ListProduk({ productCategory }: { productCategory: string }) {
  const { data: products, isLoading } = useSWR(productCategory, () =>
    getProductsByCategory(productCategory),
  );
  const [selectedProduct, setSelectedProduct] = useState<string[]>([]);

  useEffect(() => {
    setSelectedProduct([]);
  }, [productCategory]);

  const toggleSelect = (id: string) => {
    setSelectedProduct((prev) =>
      prev.includes(id)
        ? prev.filter((productId) => productId !== id)
        : [...prev, id],
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label className="font-medium">
          Pilih Porduk (Identifikasi {selectedProduct.length} / 5)
        </Label>
        <span className="block text-sm text-muted-foreground">
          Pilih 5 Produk.
        </span>
      </div>
      <Card>
        <CardContent className="">
          <ul className="grid grid-flow-col auto-rows-max w-fit grid-rows-5 gap-3">
            {isLoading ? (
              <ListCheckboxSkeleton />
            ) : products === undefined || "error" in products ? (
              <li className="text-muted-foreground">{products?.error ?? ""}</li>
            ) : (
              products?.map((product) => {
                const checked = selectedProduct.includes(product.id);
                const disabled = !checked && selectedProduct.length >= 5; // must choose 5

                return (
                  <li key={product.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`product-${product.id}`}
                      checked={checked}
                      disabled={disabled}
                      onCheckedChange={() => toggleSelect(product.id)}
                    />
                    <Label htmlFor={`product-${product.id}`}>
                      {toTitleCase(product.productName)}
                    </Label>
                    {checked && (
                      <input
                        type="hidden"
                        // IMPORTANT: ensure this name matches productExam in constant.ts
                        // replace all space with "-" and end with "-values"
                        name={"identifikasi-values"}
                        value={product.productName}
                      />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
