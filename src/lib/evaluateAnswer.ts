import {
  AllTypeOfAnswer,
  Answer,
  AnswerKeys,
  AnswerWithAdditionalValue,
  AnswerWithNote,
  AnswerWithResult,
  ExamName,
} from "./types";

type EvaluatedResult = {
  examName: string;
  answerResults: AnswerWithResult[];
  grade: number;
  additionalGrade?: number;
  note?: string;
};

export function evaluateAnswers(
  userAnswers: AllTypeOfAnswer[],
  dbAnswerKeys: AnswerKeys[],
): EvaluatedResult[] {
  if (userAnswers.length === 0) return [];
  const results: EvaluatedResult[] = [];
  const userAnswerGroup = Object.groupBy(
    userAnswers,
    (user) => user.examName.toLowerCase() as ExamName,
  );
  const dbKeysGroup = Object.groupBy(
    dbAnswerKeys,
    (user) => user.examName.toLowerCase() as ExamName,
  );
  for (const key in userAnswerGroup) {
    const groupedUserAnswers = userAnswerGroup[key as ExamName];
    const groupedDBKeys = dbKeysGroup[key as ExamName] || [];
    if (!groupedUserAnswers) {
      throw new Error(`UserAnswer tidak ditemukan ${groupedUserAnswers}`);
    }
    if (key === "identifikasi") {
      results.push(
        evaluateIdentification(groupedUserAnswers as Answer[], groupedDBKeys),
      );
    } else if (key === "skoring") {
      results.push(
        evaluateSkoring(groupedUserAnswers as AnswerWithNote[], groupedDBKeys),
      );
    } else if (key === "triangle") {
      results.push(
        evaluateTriangle(groupedUserAnswers as AnswerWithNote[], groupedDBKeys),
      );
    } else if (key.includes("2 out of 5")) {
      results.push(
        ...evaluateTwoOutOfFive(
          groupedUserAnswers as AnswerWithAdditionalValue[],
          groupedDBKeys,
        ),
      );
    } else if (key === "treshold single") {
      results.push(
        evaluateTresholdSingle(
          groupedUserAnswers as AnswerWithAdditionalValue[],
          groupedDBKeys,
        ),
      );
    } else if (key === "treshold mix") {
      results.push(
        evaluateTresholdMix(
          groupedUserAnswers as AnswerWithAdditionalValue[],
          groupedDBKeys,
        ),
      );
    }
  }
  return results;
}

function evaluateIdentification(
  userAnswers: Answer[],
  dbAnswerKeys: AnswerKeys[],
): EvaluatedResult {
  let totalCorrect = 0;
  const dbLookup = new Map(dbAnswerKeys.map((db) => [db.code, db]));
  const answerResults: AnswerWithResult[] = userAnswers.map((answer) => {
    const dbKey = dbLookup.get(answer.code);
    if (!dbKey) {
      return { ...answer, result: "wrong" };
    }
    // correct if both code + value match
    const nameMatch =
      answer.examName.toLowerCase() === dbKey.examName.toLowerCase();
    const codeMatch = answer.code === dbKey.code;
    const valueMatch = answer.value.toLowerCase() === dbKey.value.toLowerCase();
    const isCorrect = nameMatch && codeMatch && valueMatch;
    if (isCorrect) {
      totalCorrect++;
    }
    return {
      ...answer,
      result: isCorrect ? "correct" : "wrong",
    };
  });
  const attemptNumber = userAnswers[0].attemptNumber;
  const correctScore = 20;
  const grade = totalCorrect * correctScore;
  return {
    examName: "identifikasi",
    answerResults,
    grade: calculateFinalGrade(grade, attemptNumber),
  };
}

function evaluateTriangle(
  userAnswers: AnswerWithNote[],
  dbAnswerKeys: AnswerKeys[],
): EvaluatedResult {
  const triangleNote = userAnswers[0].note;
  if (!triangleNote) {
    throw new Error("Catatan ujian Triangle tidak ditemukan.");
  }
  let totalCorrect = 0;
  const dbLookup = new Map(dbAnswerKeys.map((db) => [db.code, db]));
  const answerResults: AnswerWithResult[] = userAnswers.map((answer) => {
    const dbKey = dbLookup.get(answer.code);
    if (!dbKey) {
      return { ...answer, result: "wrong" };
    }
    const nameMatch =
      answer.examName.toLowerCase() === dbKey.examName.toLowerCase();
    const codeMatch = answer.code === dbKey.code;
    const valueMatch = answer.value.toLowerCase() === dbKey.value.toLowerCase();
    const isCorrect = nameMatch && codeMatch && valueMatch;
    if (isCorrect && answer.value.toLowerCase() === "beda") {
      // track total correct only if isCorrect true and value is "beda"
      totalCorrect++;
    }
    return {
      ...answer,
      result: isCorrect ? "correct" : "wrong",
    };
  });
  const codeScore = 100;
  const attemptNumber = userAnswers[0].attemptNumber;
  const grade = totalCorrect * codeScore;
  return {
    examName: "triangle",
    answerResults,
    grade: calculateFinalGrade(grade, attemptNumber),
    note: triangleNote,
  };
}

function evaluateSkoring(
  userAnswers: AnswerWithNote[],
  dbAnswerKeys: AnswerKeys[],
): EvaluatedResult {
  const skoringNote = userAnswers[0].note;
  if (!skoringNote) {
    throw new Error("Catatan ujian Skoring tidak ditemukan.");
  }
  const valueOrder = ["1.5", "2", "3", "4", "5"];
  if (userAnswers.length !== valueOrder.length) {
    throw new Error("Harus terdapat 5 jawaban untuk ujian skoring.");
  }
  // create 2D array.
  // [ '1.5', '1223' ],
  // [ '2', '1136' ],
  // [ '3', '8189' ],
  // [ '4', '7557' ],
  // [ '5', '9105' ]
  const dbLookup = new Map(dbAnswerKeys.map((db) => [db.value, db]));
  const answerKeyAsc = valueOrder.map((value) => {
    const dbKey = dbLookup.get(value);
    if (!dbKey) {
      return [value, undefined];
    }
    return [value, dbKey.code];
  });
  const answerKeyDesc = answerKeyAsc.toReversed();
  const answerResultsAsc: AnswerWithResult[] = [];
  const answerResultsDesc: AnswerWithResult[] = [];
  let totalCorrectAsc = 0;
  let totalCorrectDesc = 0;
  for (let i = 0; i < userAnswers.length; i++) {
    const code = userAnswers[i].code;
    if (!code.trim()) {
      answerResultsAsc.push({ ...userAnswers[i], result: "wrong" });
      answerResultsDesc.push({ ...userAnswers[i], result: "wrong" });
      continue;
    }
    if (code === answerKeyAsc[i][1]) {
      answerResultsAsc.push({ ...userAnswers[i], result: "correct" });
      totalCorrectAsc++;
    } else {
      answerResultsAsc.push({ ...userAnswers[i], result: "wrong" });
    }
    if (code === answerKeyDesc[i][1]) {
      totalCorrectDesc++;
      answerResultsDesc.push({ ...userAnswers[i], result: "correct" });
    } else {
      answerResultsDesc.push({ ...userAnswers[i], result: "wrong" });
    }
  }
  let answerResults: AnswerWithResult[] = [];
  let totalCorrect = 0;
  if (totalCorrectAsc === totalCorrectDesc) {
    answerResults = answerResultsAsc;
    totalCorrect = totalCorrectAsc;
  } else if (totalCorrectAsc > totalCorrectDesc) {
    answerResults = answerResultsAsc;
    totalCorrect = totalCorrectAsc;
  } else {
    answerResults = answerResultsDesc;
    totalCorrect = totalCorrectDesc;
  }
  const attemptNumber = userAnswers[0].attemptNumber;
  const correctScore = 20;
  const grade = totalCorrect * correctScore;
  return {
    examName: "skoring",
    answerResults,
    grade: calculateFinalGrade(grade, attemptNumber),
    note: skoringNote,
  };
}

function evaluateTwoOutOfFive(
  userAnswers: AnswerWithAdditionalValue[],
  dbAnswerKeys: AnswerKeys[],
): EvaluatedResult[] {
  const totalCorrect: Record<string, number> = {};
  const dbLookup = new Map(dbAnswerKeys.map((db) => [db.code, db]));
  const answerResults: AnswerWithResult[] = userAnswers.map((answer) => {
    const dbKey = dbLookup.get(answer.code);
    if (!dbKey) {
      return { ...answer, result: "wrong" };
    }
    const nameMatch =
      answer.examName.toLowerCase() === dbKey.examName.toLowerCase();
    const codeMatch = answer.code === dbKey.code;
    const valueMatch = answer.value.toLowerCase() === dbKey.value.toLowerCase();
    const isCorrect = nameMatch && codeMatch && valueMatch;
    if (isCorrect && answer.value.toLowerCase() === "sama") {
      // grade is only from answer with value "sama"
      const standardizedKey = answer.examName.toLowerCase();
      if (!Object.hasOwn(totalCorrect, standardizedKey)) {
        totalCorrect[standardizedKey] = 0;
      }
      totalCorrect[standardizedKey] += 1;
    }
    return {
      ...answer,
      result: isCorrect ? "correct" : "wrong",
    };
  });
  const attemptNumber = userAnswers[0].attemptNumber;
  const results: EvaluatedResult[] = [];
  const grade =
    totalCorrect[userAnswers[0].examName.toLowerCase()] === 2 ? 100 : 0;
  results.push({
    examName: userAnswers[0].examName.toLowerCase(),
    answerResults,
    grade: calculateFinalGrade(grade, attemptNumber),
  });
  return results;
}

function evaluateTresholdSingle(
  userAnswers: AnswerWithAdditionalValue[],
  dbAnswerKeys: AnswerKeys[],
): EvaluatedResult {
  const dbLookup = new Map(dbAnswerKeys.map((db) => [db.code, db]));
  const total = { correctTaste: 0, wrongIntent: 0 };
  const answerResults: AnswerWithResult[] = userAnswers.map((answer) => {
    const dbKey = dbLookup.get(answer.code);
    if (!dbKey) {
      return { ...answer, result: "wrong", additionalResult: "wrong" };
    }
    const nameMatch =
      answer.examName.toLowerCase() === dbKey.examName.toLowerCase();
    const codeMatch = answer.code === dbKey.code;
    const tasteMatch = answer.value.toLowerCase() === dbKey.value.toLowerCase();
    const intensityMatch =
      answer.value.toLowerCase() === "tidak berasa" &&
      answer.additionalValue === ""
        ? true
        : answer.additionalValue?.toLowerCase() ===
          dbKey.additionalValue?.toLowerCase();
    if (nameMatch && codeMatch && tasteMatch && intensityMatch) {
      total.correctTaste++;
      return {
        ...answer,
        result: "correct",
        additionalResult: "correct",
      };
    } else if (nameMatch && codeMatch && tasteMatch) {
      total.correctTaste++;
      total.wrongIntent++;
      return {
        ...answer,
        result: "correct",
        additionalResult: "wrong",
      };
    } else {
      return {
        ...answer,
        result: "wrong",
        additionalResult: "wrong",
      };
    }
  });
  const attemptNumber = userAnswers[0].attemptNumber;
  const correctScore = 8.33;
  let tasteGrade = total.correctTaste * correctScore;
  tasteGrade = tasteGrade > 99.9 ? 100 : tasteGrade;
  let intensityGrade = (total.correctTaste - total.wrongIntent) * correctScore;
  intensityGrade = intensityGrade > 99.9 ? 100 : intensityGrade;
  return {
    examName: "treshold single",
    answerResults,
    grade: calculateFinalGrade(tasteGrade, attemptNumber),
    additionalGrade: calculateFinalGrade(intensityGrade, attemptNumber),
  };
}

function evaluateTresholdMix(
  userAnswers: AnswerWithAdditionalValue[],
  dbAnswerKeys: AnswerKeys[],
): EvaluatedResult {
  const total = { correct: 0, partial: 0 };
  const dbLookup = new Map(dbAnswerKeys.map((db) => [db.code, db]));
  const answerResults: AnswerWithResult[] = userAnswers.map((answer) => {
    const dbKey = dbLookup.get(answer.code);
    if (!dbKey) {
      return { ...answer, result: "wrong" };
    }
    const nameMatch =
      answer.examName.toLowerCase() === dbKey.examName.toLowerCase();
    const codeMatch = answer.code === dbKey.code;
    if (!nameMatch || !codeMatch) {
      return { ...answer, result: "wrong" };
    }
    const userTaste1 = answer.value.split("+")[0].toLowerCase();
    const userTaste2 = answer.additionalValue.split("+")[0].toLowerCase();
    const dbKeyTaste1 = dbKey.value.split("+")[0].toLowerCase();
    const dbKeyTaste2 = dbKey.additionalValue?.split("+")[0].toLowerCase();
    const tasteMatch = userTaste1 === dbKeyTaste1 && userTaste2 === dbKeyTaste2;
    const tasteMatchReverse =
      userTaste1 === dbKeyTaste2 && userTaste2 === dbKeyTaste1;
    const isTasteMatch = tasteMatch || tasteMatchReverse; // only compare taste, ignore intensity
    if (isTasteMatch) {
      total.correct++;
      return {
        ...answer,
        result: "correct",
      };
    }
    const hasPartialTaste =
      (userTaste1 &&
        (userTaste1 === dbKeyTaste1 || userTaste1 === dbKeyTaste2)) ||
      (userTaste2 &&
        (userTaste2 === dbKeyTaste1 || userTaste2 === dbKeyTaste2));
    if (hasPartialTaste) {
      total.partial++;
      return { ...answer, result: "partial" };
    }
    return { ...answer, result: "wrong" };
  });
  const attemptNumber = userAnswers[0].attemptNumber;
  const correctScore = 20;
  const partialScore = 10;
  const grade = total.correct * correctScore + total.partial * partialScore;
  return {
    examName: "treshold mix",
    answerResults,
    grade: calculateFinalGrade(grade, attemptNumber),
  };
}

function calculateFinalGrade(grade: number, attemptNumber: number) {
  if (attemptNumber < 1 || attemptNumber > 4) {
    throw new Error("Kesempatan ujian anda tidak valid");
  }
  const minusPoint = (attemptNumber - 1) * 10;
  return Math.max(grade - minusPoint, 0);
}
