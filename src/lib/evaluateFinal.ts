import { NormalizedExamData } from "@/actions/examSubmissions";

export function calculateExamResultsWithCompletionCheck(
  normalizedData: NormalizedExamData[],
): NormalizedExamData[] {
  if (normalizedData.length === 0) {
    return [];
  }

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

export function combineTresholdData(
  data: NormalizedExamData[],
): NormalizedExamData[] {
  return data.map((item) => {
    const result: NormalizedExamData = {
      userId: item.userId,
      username: item.username,
      name: item.name,
      departments: item.departments,
    };

    // 1. Copy non-treshold fields
    for (const [key, value] of Object.entries(item)) {
      if (!key.startsWith("treshold")) {
        result[key] = value;
      }
    }

    // 2. Combine treshold values per index
    for (let i = 1; i <= 4; i++) {
      const values = [
        item[`treshold mix_${i}`],
        item[`treshold single_${i}`],
        item[`treshold single_${i}_additional`],
      ].filter((v): v is number => typeof v === "number");

      result[`treshold_${i}`] =
        values.length > 0
          ? Number(
              (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
            )
          : null;
    }

    return result;
  });
}
