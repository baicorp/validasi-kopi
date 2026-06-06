import { Answer, AnswerWithResult } from "./types";

type EvaluatedResult = {
  examName: string;
  answerResults: AnswerWithResult[];
  grade: number;
  additionalGrade?: number;
  note?: string;
};

export function evaluateAnswers(
  userAnswers: Answer[],
  dbAnswer: Answer[],
): EvaluatedResult[] {
  if (userAnswers.length === 0) return [];
  const results: EvaluatedResult[] = [];

  const identification = evaluateIdentification(userAnswers, dbAnswer);
  results.push(identification);
  const triangle = evaluateTriangle(userAnswers, dbAnswer);
  results.push(triangle);
  const skoring = evaluateSkoring(userAnswers, dbAnswer);
  results.push(skoring);
  const twoOutOfFive = evaluateTwoOutOfFive(userAnswers, dbAnswer);
  results.push(...twoOutOfFive);
  const tresholdSingle = evaluateTresholdSingle(userAnswers, dbAnswer);
  results.push(tresholdSingle);
  const tresholdMix = evaluateTresholdMix(userAnswers, dbAnswer);
  results.push(tresholdMix);

  // only return selected exam data
  return results.filter((data) => data.answerResults.length !== 0);
}

function evaluateIdentification(
  userAnswers: Answer[],
  dbAnswers: Answer[],
): EvaluatedResult {
  const examNameTarget = "identifikasi";

  const userIdentification = userAnswers.filter(
    (answer) => answer.examName === examNameTarget,
  );
  const dbIdentification = dbAnswers.filter(
    (answer) => answer.examName === examNameTarget,
  );

  const answerResults: AnswerWithResult[] = userIdentification.map((user) => {
    // correct if both code + value match
    const isCorrect = dbIdentification.some((correct) => {
      const nameMatch =
        user.examName.toLowerCase() === correct.examName.toLowerCase();
      const codeMatch = user.code === correct.code;
      const valueMatch =
        user.value.toLowerCase() === correct.value.toLowerCase();

      return nameMatch && codeMatch && valueMatch;
    });

    return {
      ...user,
      result: isCorrect ? "correct" : "wrong",
    };
  });

  const attemptNumber = userAnswers[0].attemptNumber;
  const codeScore = 20;
  const totalCorrectCode = answerResults.filter(
    (data) => data.result === "correct",
  ).length;
  const grade = totalCorrectCode * codeScore;

  return {
    examName: examNameTarget,
    answerResults,
    grade: calculateFinalGrade(grade, attemptNumber),
  };
}

function evaluateTriangle(
  userAnswers: Answer[],
  dbAnswers: Answer[],
): EvaluatedResult {
  const examNameTarget = "triangle";

  const userTriangle = userAnswers.filter(
    (answer) => answer.examName === examNameTarget,
  );
  const dbTriangle = dbAnswers.filter(
    (answer) => answer.examName === examNameTarget,
  );

  const answerResults: AnswerWithResult[] = userTriangle.map((user) => {
    // correct if both code + value match
    const isCorrect = dbTriangle.some((correct) => {
      const nameMatch =
        user.examName.toLowerCase() === correct.examName.toLowerCase();
      const codeMatch = user.code === correct.code;
      const valueMatch = user.value === correct.value;

      return nameMatch && codeMatch && valueMatch;
    });

    return {
      ...user,
      result: isCorrect ? "correct" : "wrong",
    };
  });

  // prevent errors when triangle is not part of the submission”
  const note = answerResults[0]?.note ?? "";
  const codeScore = 100;
  const attemptNumber = userAnswers[0].attemptNumber;
  const grade =
    answerResults.filter(
      (data) => data.value === "beda" && data.result === "correct",
    ).length * codeScore;

  return {
    examName: examNameTarget,
    answerResults,
    grade: calculateFinalGrade(grade, attemptNumber),
    note,
  };
}

function evaluateSkoring(
  userAnswers: Answer[],
  dbAnswers: Answer[],
): EvaluatedResult {
  const examNameTarget = "skoring";

  const userList = userAnswers.filter((a) => a.examName === examNameTarget);
  const dbList = dbAnswers.filter((a) => a.examName === examNameTarget);

  const valueOrder = ["1.5", "2", "3", "4", "5"];
  // create 2D array.
  // [ '1.5', '1223' ],
  // [ '2', '1136' ],
  // [ '3', '8189' ],
  // [ '4', '7557' ],
  // [ '5', '9105' ]
  const answerKeyAsc = valueOrder.map((value) => {
    const found = dbList.find((data) => data.value == value);
    return [value, (found && found.code) || ""];
  });
  const answerKeyDesc = answerKeyAsc.toReversed();

  const answerResultsAsc: AnswerWithResult[] = [];
  const answerResultsDesc: AnswerWithResult[] = [];

  let totalCorrectAsc = 0;
  let totalCorrectDesc = 0;

  for (let i = 0; i < userList.length; i++) {
    const code = userList[i].code;
    if (code === "") {
      answerResultsAsc.push({ ...userList[i], result: "wrong" });
      answerResultsDesc.push({ ...userList[i], result: "wrong" });
      continue;
    }

    if (code === answerKeyAsc[i][1]) {
      answerResultsAsc.push({ ...userList[i], result: "correct" });
      totalCorrectAsc++;
    } else {
      answerResultsAsc.push({ ...userList[i], result: "wrong" });
    }

    if (code === answerKeyDesc[i][1]) {
      totalCorrectDesc++;
      answerResultsDesc.push({ ...userList[i], result: "correct" });
    } else {
      answerResultsDesc.push({ ...userList[i], result: "wrong" });
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

  // prevent errors when skoring is not part of the submission
  const note = answerResults[0]?.note ?? "";
  const attemptNumber = userAnswers[0].attemptNumber;
  const codeScore = 20;
  const grade = totalCorrect * codeScore;

  return {
    examName: examNameTarget,
    answerResults,
    grade: calculateFinalGrade(grade, attemptNumber),
    note,
  };
}

function evaluateTwoOutOfFive(
  userAnswers: Answer[],
  dbAnswers: Answer[],
): EvaluatedResult[] {
  const examNameTarget = "2 out of 5";
  const twoOutOfFiveVariant = ["creamer", "pure", "coklat"];
  const userTwoOutOfFiveList = userAnswers.filter((answer) =>
    answer.examName.includes(examNameTarget),
  );
  const dbTwoOutOfFiveList = dbAnswers.filter((answer) =>
    answer.examName.includes(examNameTarget),
  );

  const answerResults: AnswerWithResult[] = userTwoOutOfFiveList.map((user) => {
    // correct => code + value
    const isCorrect = dbTwoOutOfFiveList.some((correct) => {
      const nameMatch =
        user.examName.toLowerCase() === correct.examName.toLowerCase();
      const codeMatch = user.code === correct.code;
      const valueMatch =
        user.value.toLowerCase() === correct.value.toLowerCase();

      return nameMatch && codeMatch && valueMatch;
    });

    return {
      ...user,
      result: isCorrect ? "correct" : "wrong",
    };
  });

  const attemptNumber = userAnswers[0].attemptNumber;

  return twoOutOfFiveVariant.map((variant) => {
    const variantResults = answerResults.filter(
      (data) => data.examName === `${examNameTarget} ${variant}`,
    );

    const totalCorrectCode = variantResults.filter(
      (data) =>
        data.result === "correct" && data.value.toLowerCase() === "sama",
    ).length;
    const grade = totalCorrectCode === 2 ? 100 : 0;

    return {
      examName: `${examNameTarget} ${variant}`,
      answerResults: variantResults,
      grade: calculateFinalGrade(grade, attemptNumber),
    };
  });
}

function evaluateTresholdSingle(
  userAnswers: Answer[],
  dbAnswers: Answer[],
): EvaluatedResult {
  const examNameTarget = "treshold single";
  const userTresholdSingleList = userAnswers.filter(
    (answer) => answer.examName === examNameTarget,
  );
  const dbTresholdSingleList = dbAnswers.filter(
    (answer) => answer.examName === examNameTarget,
  );

  const dbLookup = new Map(dbTresholdSingleList.map((db) => [db.code, db]));

  const answerResults: AnswerWithResult[] = userTresholdSingleList.map(
    (user) => {
      const matchAnswer = dbLookup.get(user.code);

      if (!matchAnswer) {
        return {
          ...user,
          result: "wrong",
        };
      }

      const nameMatch =
        user.examName.toLowerCase() === matchAnswer.examName.toLowerCase();
      const codeMatch = user.code === matchAnswer.code;
      const tasteMatch =
        user.value.toLowerCase() === matchAnswer.value.toLowerCase();
      const intensityMatch =
        user.additionalValue === matchAnswer.additionalValue;

      if (nameMatch && codeMatch && tasteMatch && intensityMatch) {
        return {
          ...user,
          result: "correct",
          additionalResult: "correct",
        };
      }

      if (nameMatch && codeMatch && tasteMatch) {
        return {
          ...user,
          result: "correct",
          additionalResult: "wrong",
        };
      }

      return {
        ...user,
        result: "wrong",
      };
    },
  );

  const attemptNumber = userAnswers[0].attemptNumber;
  const codeScore = 8.33;

  const totalCorrectTaste = answerResults.filter(
    (answer) => answer.result === "correct",
  ).length;
  let tasteGrade = totalCorrectTaste * codeScore;
  tasteGrade = tasteGrade === 99.96000000000001 ? 100 : tasteGrade;

  const totalCorrectIntensity = answerResults.filter(
    (answer) => answer.additionalResult === "correct",
  ).length;
  let intensityGrade = totalCorrectIntensity * codeScore;
  intensityGrade = intensityGrade === 99.96000000000001 ? 100 : intensityGrade;

  return {
    examName: examNameTarget,
    answerResults,
    grade: calculateFinalGrade(tasteGrade, attemptNumber),
    additionalGrade: calculateFinalGrade(intensityGrade, attemptNumber),
  };
}

function evaluateTresholdMix(
  userAnswers: Answer[],
  dbAnswers: Answer[],
): EvaluatedResult {
  const examNameTarget = "treshold mix";
  const userTresholdMix = userAnswers.filter(
    (answer) => answer.examName === examNameTarget,
  );
  const dbTresholdMixList = dbAnswers.filter(
    (answer) => answer.examName === examNameTarget,
  );

  const answerResults: AnswerWithResult[] = userTresholdMix.map((user) => {
    const matchAnswer = dbTresholdMixList.find(
      (list) => list.examName === user.examName && list.code === user.code,
    );

    if (!matchAnswer) {
      return {
        ...user,
        result: "wrong",
      };
    }

    const userTaste1 = user.value.split("+")[0].toLowerCase();
    const userTaste2 = user.additionalValue?.split("+")[0].toLowerCase();
    const correctTaste1 = matchAnswer.value.split("+")[0].toLowerCase();
    const correctTaste2 = matchAnswer.additionalValue
      ?.split("+")[0]
      .toLowerCase();

    const nameMatch =
      user.examName.toLowerCase() === matchAnswer.examName.toLowerCase();
    const codeMatch = user.code === matchAnswer.code;

    const taste1Match = userTaste1 === correctTaste1;
    const taste2Match = userTaste2 === correctTaste2;
    const taste1MatchReverse = userTaste1 === correctTaste2;
    const taste2MatchReverse = userTaste2 === correctTaste1;

    const isTasteMatch =
      (taste1Match && taste2Match) ||
      (taste1MatchReverse && taste2MatchReverse);

    if (!nameMatch || !codeMatch) {
      return { ...user, result: "wrong" };
    }

    if (isTasteMatch) {
      return {
        ...user,
        result: "correct",
        additionalResult: "correct",
      };
    }

    const hasPartialTaste =
      (userTaste1 &&
        (userTaste1 === correctTaste1 || userTaste1 === correctTaste2)) ||
      (userTaste2 &&
        (userTaste2 === correctTaste1 || userTaste2 === correctTaste2));

    if (hasPartialTaste) {
      return { ...user, result: "partial" };
    }

    return { ...user, result: "wrong" };
  });

  const attemptNumber = userAnswers[0].attemptNumber;
  const correctCodeScore = 20;
  const partialCodeScore = 10;
  const totalCorrectCode = answerResults.filter(
    (data) => data.result === "correct",
  ).length;
  const totalPartialCode = answerResults.filter(
    (data) => data.result === "partial",
  ).length;

  let grade = totalCorrectCode * correctCodeScore;
  grade += totalPartialCode * partialCodeScore;

  return {
    examName: examNameTarget,
    answerResults,
    grade: calculateFinalGrade(grade, attemptNumber),
  };
}

function calculateFinalGrade(grade: number, attemptNumber: number | undefined) {
  if (!attemptNumber) {
    throw new Error("Jawaban yang dikumpulkan tidak memiliki attempt number");
  }
  let minusPoint = 0;
  switch (attemptNumber) {
    case 2: // retake 1
      minusPoint = 10;
      break;
    case 3: // retake 2
      minusPoint = 20;
      break;
    case 4: // retake 3
      minusPoint = 30;
      break;
    default:
      minusPoint = 0;
      break;
  }

  const finalGrade = grade - minusPoint;
  return finalGrade < 0 ? 0 : finalGrade;
}
