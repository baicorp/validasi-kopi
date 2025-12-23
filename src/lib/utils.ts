import { RawExamsData } from "./types";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

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
  const groupData = new Map<
    string,
    {
      examName: string;
      codeValue: Map<string, string[]>;
    }
  >();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row) continue;

    let baseEntry = groupData.get(row.examName);
    if (!baseEntry) {
      baseEntry = {
        examName: row.examName,
        codeValue: new Map<string, string[]>(),
      };
      groupData.set(row.examName, baseEntry);
    }

    const key = row.additionalValue
      ? `${row.value} & ${row.additionalValue}`
      : row.value;

    let codes = baseEntry.codeValue.get(key);
    if (!codes) {
      codes = [];
      baseEntry.codeValue.set(key, codes);
    }

    codes.push(row.code);
  }

  const resultArr = new Array<{
    examName: string;
    codeValue: Record<string, string[][]>[];
  }>(groupData.size);
  let i = 0;

  for (const data of groupData.values()) {
    const codeValueArr = new Array<Record<string, string[][]>>(
      data.codeValue.size,
    );

    let j = 0;
    for (const [key, values] of data.codeValue) {
      codeValueArr[j++] = { [key]: formatArrToTJ(values) };
    }

    resultArr[i++] = {
      examName: data.examName,
      codeValue: codeValueArr,
    };
  }

  return resultArr;
}

export function getExamsId(
  examName: string,
  exams: { id: string; examName: string }[],
): string | undefined {
  for (const exam of exams) {
    if (exam.examName.toLowerCase() === examName.toLowerCase()) return exam.id;
  }

  return undefined;
}

export function toTitleCase(str: string) {
  const strArr = str.toLowerCase().split(" ");

  return strArr
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

function parseSingle(val: string) {
  const [taste, intensity] = val.split(" & ");
  return { taste, intensity };
}

function parseMix(val: string) {
  const [firstMix, secondMix] = val.split(" & ");
  return { firstMix, secondMix };
}

export function codeCheck(
  inputCode: string,
  inputValue: string,
  rowsData: RawExamsData[],
) {
  const examData = rowsData.find((d) => d.code === inputCode);
  if (!examData) return "wrong"; // code not found in given value

  const examName = examData.examName.toLowerCase();
  const examValue = examData.additionalValue
    ? `${examData.value} & ${examData.additionalValue}`
    : examData.value;

  if (examName.includes("2 out of 5")) {
    // value format ex: "benar & productName", we need only the first word
    const correctValue = inputValue.split(" & ")[0];
    return examData.value === correctValue ? "correct" : "wrong";
  }

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
    if (inputValue === examValue) {
      return "correct";
    }
    const { firstMix: firstMixInput, secondMix: secondMixInput } =
      parseMix(inputValue);
    const { firstMix: firstMixUser, secondMix: secondMixUser } =
      parseMix(examValue);

    const userMixOne = firstMixUser.split("+")[0];
    const userMixTwo = secondMixUser.split("+")[0];
    const inputMixOne = firstMixInput.split("+")[0];
    const inputMixTwo = secondMixInput.split("+")[0];

    if (
      userMixOne === inputMixOne ||
      userMixOne === inputMixTwo ||
      userMixTwo === inputMixOne ||
      userMixTwo === inputMixTwo
    ) {
      return "partially-wrong";
    }

    return "wrong";
  }

  return inputValue === examValue ? "correct" : "wrong";
}

export function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  return array;
}
