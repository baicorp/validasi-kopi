import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RawExamsData } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArrToTJ(listKode: string[]): string[][] {
  const jumlahKodePerBaris = 15;
  const listKodeTerformat = [];
  for (let i = 0; i < listKode.length; i += jumlahKodePerBaris) {
    listKodeTerformat.push(listKode.slice(i, i + jumlahKodePerBaris));
  }
  // ex: [[1,2,4,5,6,7,8,9,10,11,12,13,14,15], [...]]. each row 15 code.
  return listKodeTerformat;
}

export function formatRawExamsData(rows: RawExamsData[]) {
  // 1. group rows by examName
  const groupedByExam = Object.groupBy(rows, (item) => item.examName);

  const formatedRows = Object.entries(groupedByExam).map(
    ([examName, group]) => {
      // 2. group groupedByExam by value
      const groupedByValue = Object.groupBy(group!, (item) => item.value!);

      // 3. get each value with its list of codes
      const codeValue = Object.entries(groupedByValue).map(
        ([valueKey, items]) => ({
          [valueKey]: formatArrToTJ(items!.map((item) => item.code)),
        }),
      );

      return { examName, codeValue };
    },
  );

  return formatedRows;
}

export function getExamsId(
  examName: string,
  exams: { id: number; examName: string }[],
): number {
  for (const exam of exams) {
    if (exam.examName.toLowerCase() === examName.toLowerCase()) return exam.id;
  }

  return -1;
}

export function toTitleCase(str: string) {
  const strArr = str.toLowerCase().split(" ");

  return strArr
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

function parseSingle(val: string) {
  const [taste, intensity] = val.split(" ");
  return { taste, intensity };
}

function parseMix(val: string) {
  return val.split("+").map((v) => v.trim());
}

export function codeCheck(
  inputCode: string,
  inputValue: string,
  rowsData: RawExamsData[],
) {
  const examData = rowsData.find((d) => d.code === inputCode);
  if (!examData) return "wrong"; // code not found in given value

  const examName = examData.examName.toLowerCase();
  const examValue = examData.value;

  if (examName === "treshold single") {
    const { taste: valueFromInput, intensity: intenFromInput } =
      parseSingle(inputValue);
    const { taste: correctValue, intensity: correctInten } =
      parseSingle(examValue);

    // value and intensity is match
    if (valueFromInput === correctValue && intenFromInput === correctInten) {
      return "correct";
    }
    // only value is match
    if (valueFromInput === correctValue) {
      return "partially-wrong";
    }

    return "wrong";
  }

  if (examName === "treshold mix") {
    const tasteInput = parseMix(inputValue);
    const tasteValue = parseMix(examValue);

    const match = tasteInput.filter((taste) =>
      tasteValue.includes(taste),
    ).length;

    if (match === 2) return "correct";
    if (match === 1) return "partially-wrong";
    return "wrong";
  }

  return inputValue === examValue ? "correct" : "wrong";
}
