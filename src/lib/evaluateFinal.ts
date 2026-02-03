import { NormalizedExamData } from "@/actions/examSubmissions";

export function calculateExamResultsWithCompletionCheck(
  normalizedData: NormalizedExamData[],
): NormalizedExamData[] {
  const NUM_ATTEMPTS = 4;

  const resultsWithCalculations: NormalizedExamData[] = [];

  // extract exam grade keys that contain "_", all grade data in examName_numberAttempt. ex: identifikasi_1
  const examGradeKeys = Object.keys(normalizedData[0]).filter((key) =>
    key.includes("_"),
  );
  for (const item of normalizedData) {
    // group grades by exam name (ex: identifikasi_1 → identifikasi)
    const finalGrade: number[] = [];
    const gradeGroupByExamName: Record<string, (number | null)[]> = {};

    for (const key of examGradeKeys) {
      const [examKey] = key.split("_");

      const grade = item[key];
      if (typeof grade === "string") {
        throw Error("Tipe data `Nilai` tidak seharusnya string");
      }

      if (!gradeGroupByExamName[examKey]) {
        gradeGroupByExamName[examKey] = [];
      }
      gradeGroupByExamName[examKey].push(grade);
    }

    const gradeGroupByExamNameKeys = Object.keys(gradeGroupByExamName);
    for (const key of gradeGroupByExamNameKeys) {
      const cleanGrade = gradeGroupByExamName[key].filter(
        (grade) => grade !== null,
      );

      // if any attempt >= 70 → use last attempt
      if (cleanGrade.some((grade) => grade >= 70)) {
        finalGrade.push(cleanGrade[cleanGrade.length - 1]);
        continue;
      }

      // if no attempt ≥ 70 but all attempts were used → use the last attempt
      if (cleanGrade.length === NUM_ATTEMPTS) {
        finalGrade.push(cleanGrade[cleanGrade.length - 1]);
      }
    }

    const totalExam = gradeGroupByExamNameKeys.length;
    // only calculate averageGrade and result if the number of final grades matches the total number of exams
    // totalExam > 0 => prevent division by 0 error
    if (finalGrade.length === totalExam && totalExam > 0) {
      const averageGrade = (
        finalGrade.reduce((acc, n) => acc + n, 0) / totalExam
      ).toFixed(2);
      const averageGradeNumber = parseFloat(averageGrade);
      item["averageGrade"] = finalGrade.every((grade) => grade >= 70)
        ? averageGradeNumber
        : 0;
      item["result"] = finalGrade.every((grade) => grade >= 70)
        ? "LULUS"
        : "TIDAK LULUS";
    } else {
      item["averageGrade"] = null;
      item["result"] = null;
    }

    resultsWithCalculations.push(item);
  }

  return resultsWithCalculations;
}
