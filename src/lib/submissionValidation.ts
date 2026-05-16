import { Answer } from "./types";

export function hasNoDuplicates(answers: Answer[]) {
  if (answers.length === 0) {
    throw Error("Semua input form harus diisi.");
  }
  const uniqueCode = new Set<string>();
  const uniqueProductName = new Set<string>();
  let totalCodeCount = 0;
  let totalProductNameCount = 0;

  for (const obj of answers) {
    const isIdentifikasi = obj.examName === "identifikasi";

    if (isIdentifikasi && obj.value) {
      uniqueProductName.add(obj.value);
      totalProductNameCount++;
    }
    if (obj.code) {
      uniqueCode.add(obj.code);
      totalCodeCount++;
    }
  }

  return (
    uniqueCode.size === totalCodeCount &&
    uniqueProductName.size === totalProductNameCount
  );
}
