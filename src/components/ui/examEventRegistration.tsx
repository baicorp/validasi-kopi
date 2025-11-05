"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
import { toast } from "sonner";
import { Label } from "./label";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { toTitleCase } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { basicExam, productExam } from "@/lib/constant";
import { CheckedState } from "@radix-ui/react-checkbox";
import { registerEvent } from "@/actions/examRegistrations";

type ExamCategory = "uji dasar" | "uji produk";

export default function ExamFormRegistration({
  examEventId,
}: {
  examEventId: string;
}) {
  const [examCategory, setExamCategory] = useState<ExamCategory>("uji dasar");
  const [isLoad, setIsLoad] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoad(true);
    const formData = new FormData(e.currentTarget);
    const result = await registerEvent(formData, Number(examEventId));

    if ("error" in result) {
      toast.error(result.error);
      setIsLoad(false);
      return;
    }

    setIsLoad(false);
    toast.success("Berhasil mendaftar.");
  }

  return (
    <form
      className="flex flex-col gap-4 w-[minmax(100%,390px)]"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2 basis-full">
        <Label>Pilih kategori ujian</Label>
        <Select
          name="exam-category"
          required
          value={examCategory}
          onValueChange={(value) => {
            setExamCategory(value as ExamCategory);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih kategori ujian" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>kategori ujian</SelectLabel>
              <SelectItem value="uji dasar">uji dasar</SelectItem>
              <SelectItem value="uji produk">uji produk</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {examCategory && (
        <div className="flex flex-col">
          <Label>Daftar ujian {examCategory}</Label>
          <div className="flex flex-col gap-4">
            <ListExam examCategory={examCategory} isLoad={isLoad} />
          </div>
        </div>
      )}
    </form>
  );
}

function ListExam({
  examCategory,
  isLoad,
}: {
  examCategory: string;
  isLoad: boolean;
}) {
  const [selectedExam, setSelectedExam] = useState<string[]>([]);

  function handleSelectedExamChange(e: CheckedState, examName: string) {
    if (e && !selectedExam.includes(examName)) {
      setSelectedExam((prev) => [...prev, examName].sort());
    } else if (!e) {
      setSelectedExam((prev) => prev.filter((exam) => exam !== examName));
    }
  }

  useEffect(() => {
    setSelectedExam([]);
  }, [examCategory]);

  const exams = examCategory === "uji dasar" ? basicExam : productExam;

  return (
    <>
      <div className="grid grid-cols-2 w-fit gap-x-3 gap-y-2 mt-2.5">
        {exams.map((exam) => {
          const checkboxId = exam.replaceAll(" ", "-");
          return (
            <Label key={exam} htmlFor={checkboxId} className="font-normal">
              <Checkbox
                id={checkboxId}
                onCheckedChange={(e) => handleSelectedExamChange(e, exam)}
              />
              <span>{toTitleCase(exam)}</span>
            </Label>
          );
        })}
      </div>

      <Button
        disabled={selectedExam.length === 0 || isLoad}
        type="submit"
        className="w-full"
      >
        Simpan
        {isLoad && <LoaderCircle className="animate-spin" />}
      </Button>

      {/* Hidden input to store date value in FormData */}
      {selectedExam.map((exam) => (
        <input name="selected-exam" key={exam} type="hidden" value={exam} />
      ))}
    </>
  );
}
