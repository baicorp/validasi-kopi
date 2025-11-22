import { Answer, AnswerWithResult } from "./types";

type EvaluatedResult = {
  examName: string;
  answerResults: AnswerWithResult[];
  grade: number;
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

  const codeScore = 20;
  const grade =
    answerResults.filter((data) => data.result === "correct").length *
    codeScore;

  return { examName: examNameTarget, answerResults, grade };
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

  const codeScore = 100;
  const grade =
    answerResults.filter(
      (data) => data.value === "beda" && data.result === "correct",
    ).length * codeScore;

  return { examName: examNameTarget, answerResults, grade };
}

function evaluateSkoring(
  userAnswers: Answer[],
  dbAnswers: Answer[],
): EvaluatedResult {
  const examNameTarget = "skoring";

  const userList = userAnswers.filter((a) =>
    a.examName.includes(examNameTarget),
  );
  const dbList = dbAnswers.filter((a) => a.examName.includes(examNameTarget));

  // FIXME : this implementation is not quite right yet
  // Mapping rules in a single object for clarity
  const equivalents: Record<string, string[]> = {
    "1.5": ["1.5", "5"],
    "5": ["1.5", "5"],
    "2": ["2", "4"],
    "4": ["2", "4"],
    "3": ["3"],
  };

  const answerResults: AnswerWithResult[] = userList.map((user) => {
    const acceptedValues = equivalents[user.value] ?? [];

    const isCorrect = dbList.some((correct) => {
      const nameMatch =
        correct.examName.toLowerCase() === user.examName.toLowerCase();
      const codeMatch = correct.code === user.code;
      const valueMatch = acceptedValues.includes(correct.value);

      return nameMatch && codeMatch && valueMatch;
    });

    return { ...user, result: isCorrect ? "correct" : "wrong" };
  });

  const codeScore = 20;
  const grade =
    answerResults.filter((data) => data.result === "correct").length *
    codeScore;

  return { examName: examNameTarget, answerResults, grade };
}

function evaluateTwoOutOfFive(
  userAnswers: Answer[],
  dbAnswers: Answer[],
): EvaluatedResult[] {
  const examNameTarget = "2 out of 5";
  const userTwoOutOfFiveList = userAnswers.filter((answer) =>
    answer.examName.includes(examNameTarget),
  );
  const dbTwoOutOfFiveList = dbAnswers.filter((answer) =>
    answer.examName.includes(examNameTarget),
  );

  const answerResults: AnswerWithResult[] = userTwoOutOfFiveList.map((user) => {
    // correct => code + value + additional value
    const isCorrect = dbTwoOutOfFiveList.some((correct) => {
      const nameMatch =
        user.examName.toLowerCase() === correct.examName.toLowerCase();
      const codeMatch = user.code === correct.code;
      const valueMatch =
        user.value.toLowerCase() === correct.value.toLowerCase();
      const addValueMatch =
        user.additionalValue?.toLowerCase() ===
        correct.additionalValue?.toLowerCase();

      return nameMatch && codeMatch && valueMatch && addValueMatch;
    });

    return {
      ...user,
      result: isCorrect ? "correct" : "wrong",
    };
  });

  const twoOutOfFiveCreamer = answerResults.filter(
    (data) => data.examName === "2 out of 5 campuran kopi",
  );
  const twoOutOfFivePure = answerResults.filter(
    (data) => data.examName === "2 out of 5 kopi pure",
  );

  const codeScore = 20;
  const gradeCreamer =
    twoOutOfFiveCreamer.filter((data) => data.result === "correct").length *
    codeScore;
  const gradePure =
    twoOutOfFivePure.filter((data) => data.result === "correct").length *
    codeScore;

  return [
    {
      examName: "2 out of 5 campuran kopi",
      answerResults: twoOutOfFiveCreamer,
      grade: gradeCreamer,
    },
    {
      examName: "2 out of 5 kopi pure",
      answerResults: twoOutOfFivePure,
      grade: gradePure,
    },
  ];
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

  const answerResults: AnswerWithResult[] = userTresholdSingleList.map(
    (user) => {
      // correct => code + value + additional value
      const isCorrect = dbTresholdSingleList.some((correct) => {
        const nameMatch =
          user.examName.toLowerCase() === correct.examName.toLowerCase();
        const codeMatch = user.code === correct.code;
        const tasteMatch =
          user.value.toLowerCase() === correct.value.toLowerCase();
        const intensityMatch = user.additionalValue === correct.additionalValue;

        return nameMatch && codeMatch && tasteMatch && intensityMatch;
      });

      // correct => code + value (only run when isCorrect is false)
      const isPartial =
        !isCorrect &&
        dbTresholdSingleList.some((correct) => {
          const nameMatch =
            user.examName.toLowerCase() === correct.examName.toLowerCase();
          const codeMatch = user.code === correct.code;
          const tasteMatch =
            user.value.toLowerCase() === correct.value.toLowerCase();

          return nameMatch && codeMatch && tasteMatch;
        });

      return {
        ...user,
        result: isCorrect ? "correct" : isPartial ? "partial" : "wrong",
      };
    },
  );

  const codeScore = 8.33;
  const grade =
    answerResults.filter(
      (data) => data.result === "correct" || data.result === "partial",
    ).length * codeScore;

  return { examName: examNameTarget, answerResults, grade };
}

function evaluateTresholdMix(
  userAnswers: Answer[],
  dbAnswers: Answer[],
): EvaluatedResult {
  const examNameTarget = "treshold mix";
  const userTresholdSingleList = userAnswers.filter(
    (answer) => answer.examName === examNameTarget,
  );
  const dbTresholdSingleList = dbAnswers.filter(
    (answer) => answer.examName === examNameTarget,
  );

  const answerResults: AnswerWithResult[] = userTresholdSingleList.map(
    (user) => {
      // correct => if all taste and intensity all correct
      const isCorrect = dbTresholdSingleList.some((correct) => {
        const nameMatch =
          user.examName.toLowerCase() === correct.examName.toLowerCase();
        const codeMatch = user.code === correct.code;
        const taste1Match =
          user.value.toLowerCase() === correct.value.toLowerCase();
        const taste2Match =
          user.additionalValue?.toLowerCase() ===
          correct.additionalValue?.toLowerCase();

        return nameMatch && codeMatch && taste1Match && taste2Match;
      });

      // partial => if on of the taste is correct (only run when isCorrect is false)
      // ex in db => value : asam+1 ,additionalValue: manis+3 so we split using + and target index 0
      const isPartial =
        !isCorrect &&
        dbTresholdSingleList.some((correct) => {
          if (
            user.examName.toLowerCase() !== correct.examName.toLowerCase() ||
            user.code !== correct.code
          ) {
            return false;
          }

          const userTaste1 = user.value.split("+")[0];
          const userTaste2 = user.additionalValue?.split("+")[0];
          const correctTaste1 = correct.value.split("+")[0];
          const correctTaste2 = correct.additionalValue?.split("+")[0];

          return (
            correctTaste1 === userTaste1 ||
            correctTaste2 === userTaste2 ||
            correctTaste1 === userTaste2 ||
            correctTaste2 === userTaste1
          );
        });

      return {
        ...user,
        result: isCorrect ? "correct" : isPartial ? "partial" : "wrong",
      };
    },
  );

  const correctCodeScore = 20;
  const partialCodeScore = 10;
  let grade =
    answerResults.filter((data) => data.result === "correct").length *
    correctCodeScore;
  grade +=
    answerResults.filter((data) => data.result === "partial").length *
    partialCodeScore;

  return { examName: examNameTarget, answerResults, grade };
}
