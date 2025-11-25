"use server";

import { db } from "@/db";
import {
  examEvents,
  examRegistrations,
  examSubmissionNotes,
  examSubmissions,
  submissionAttempts,
} from "@/db/schema/examEvents";
import { Answer } from "@/lib/types";
import { getAllExams } from "./exams";
import { getExamsId } from "@/lib/utils";
import { evaluateAnswers } from "@/lib/evaluateAnswer";
import { and, eq, InferInsertModel, or, sql } from "drizzle-orm";
import { isValidRole, validateSessionServer } from "./validateSession";
import { codeGroups, codes, departments, exams, user } from "@/db/schema";

export async function submitExam(
  submittedExamData: Answer[],
  examEventId: string,
) {
  try {
    // 1. get user id;
    const session = await validateSessionServer();
    const userId = session.user.id;

    // 2. get all exams data from db
    const examsData = await getAllExams();
    if (!examsData) {
      return { error: "Gagal mendapatkan daftar nama ujian" };
    }

    const transactionResult = await db.transaction(async (tx) => {
      // 3. check how many time user already submit exam
      const [{ latestAttempt }] = await tx
        .select({
          latestAttempt: sql<number>`max(${submissionAttempts.numberAttempt})`,
        })
        .from(submissionAttempts)
        .where(
          and(
            eq(submissionAttempts.examEventId, examEventId),
            eq(submissionAttempts.userId, userId),
          ),
        );

      // 4. get codeGroupId based on how many times user already take
      const nextAttempt = (latestAttempt ?? 0) + 1;
      if (nextAttempt > 4) {
        throw new Error("Kesempatan perbaikan ujian anda sudah habis.");
      }

      const targetGroupColumn =
        nextAttempt > 1
          ? examEvents.codeGroupRetakeId
          : examEvents.codeGroupRegulerId;

      const [{ codeGroupId, selectedExamForFirstTimeExam }] = await tx
        .select({
          codeGroupId: codeGroups.id,
          selectedExamForFirstTimeExam: codeGroups.selectedExam,
        })
        .from(examEvents)
        .leftJoin(codeGroups, eq(targetGroupColumn, codeGroups.id))
        .leftJoin(
          examRegistrations,
          eq(examRegistrations.examEventId, examEvents.id),
        )
        .where(
          and(
            eq(examEvents.id, examEventId),
            eq(examRegistrations.userId, userId),
          ),
        );

      if (!codeGroupId || !selectedExamForFirstTimeExam) {
        throw Error("Gagal mendapatkan codeGroupId dan daftar ujian");
      }

      // 5. get selectedExam based on user number of submission attempt
      let selectedExam: string = "";

      if (nextAttempt > 1) {
        const rows = await tx
          .select({ retakeExam: submissionAttempts.retakeExam })
          .from(submissionAttempts)
          .where(
            and(
              eq(submissionAttempts.numberAttempt, nextAttempt - 1),
              eq(submissionAttempts.examEventId, examEventId),
              eq(submissionAttempts.userId, userId),
            ),
          );
        const selectedExamForRetakeExam = rows
          .map((data) => data.retakeExam)
          .filter((exam) => exam && exam.length > 0)
          .toString();
        selectedExam = selectedExamForRetakeExam;
      } else {
        selectedExam = selectedExamForFirstTimeExam ?? "";
      }

      // 6. filter input data to only get current selected exam
      submittedExamData = submittedExamData.filter((data) =>
        selectedExam?.split(",")?.some((exam) => exam.includes(data.examName)),
      );
      submittedExamData = submittedExamData.map((data) => ({
        ...data,
        code: data.code ? data.code : "",
        value: data.value ? data.value : "",
        attemptNumber: nextAttempt,
        note: data.note ? data.note : "",
      }));

      // 7. if selectedExam include skoring, we have to provide additional code value pairs
      const skoringMap: Record<string, string> = {
        "1.5": "5",
        "2": "4",
        "4": "2",
        "5": "1.5",
      };

      const additionalSkoringData: Answer[] = [];

      for (const data of submittedExamData) {
        if (data.examName !== "skoring") continue;

        const newValue = skoringMap[data.value];
        if (!newValue) continue;

        additionalSkoringData.push({
          ...data,
          value: newValue,
          code: data.code,
        });
      }

      // this submittedExamDataForDbLookUp is only use for database look up
      const submittedExamDataForDbLookUp = [
        ...submittedExamData,
        ...additionalSkoringData,
      ];

      const normalizedPairs = submittedExamDataForDbLookUp.map((data) => ({
        examName: data.examName.toLowerCase(),
        code: data.code.toLowerCase(),
        value: data.value.toLowerCase(),
      }));

      // FIXME: this database lookup is not 100% valid for thresholdMix lookup
      const orConditions = normalizedPairs.map((pair) =>
        and(
          eq(sql`lower(${exams.examName})`, pair.examName),
          eq(sql`lower(${codes.code})`, pair.code),
          eq(sql`lower(${codes.value})`, pair.value),
        ),
      );

      const dbAnswerList = await tx
        .select({
          examName: exams.examName,
          code: codes.code,
          value: codes.value,
          additionalValue: codes.additionalValue,
        })
        .from(codes)
        .leftJoin(exams, eq(codes.examId, exams.id))
        .where(and(eq(codes.codeGroupId, codeGroupId), or(...orConditions)));

      // 8. evaluate answer list by comparing userAnswerList and dbAnswerList.
      // then give result either "correct" | "partial" | "wrong"
      // @ts-expect-error correct answer actually work (null and undefined)
      const results = evaluateAnswers(submittedExamData, dbAnswerList);

      // 9. insert submissionAttempts data and submissionNote if available;
      const submissionNoteData: InferInsertModel<typeof examSubmissionNotes>[] =
        [];
      const submissionAttemptsInsertValues: InferInsertModel<
        typeof submissionAttempts
      >[] = results.map((data) => {
        const examId = getExamsId(data.examName, examsData);
        if (!examId) {
          throw Error("ID ujian tidak ditemukan.");
        }
        const submissionAttemptId = crypto.randomUUID();

        if (data.note) {
          // this data for insert examSubmissionNotes
          submissionNoteData.push({ submissionAttemptId, note: data.note });
        }

        return {
          id: submissionAttemptId,
          numberAttempt: nextAttempt,
          examEventId,
          userId,
          examId,
          grade: data.grade,
          retakeExam: data.grade < 70 ? data.examName : "",
        };
      });
      await tx
        .insert(submissionAttempts)
        .values(submissionAttemptsInsertValues);

      await tx.insert(examSubmissionNotes).values(submissionNoteData);

      // 10. get submissionAttempts inserted rows data
      const insertedRows = await tx
        .select({
          id: submissionAttempts.id,
          examId: submissionAttempts.examId,
        })
        .from(submissionAttempts)
        .where(
          and(
            eq(submissionAttempts.examEventId, examEventId),
            eq(submissionAttempts.numberAttempt, nextAttempt),
          ),
        );

      // 11. insert examSubmissions data
      const attemptMap = new Map<string, string>();
      for (const row of insertedRows) {
        attemptMap.set(row.examId, row.id);
      }

      const examSubmissionsInsertValues: InferInsertModel<
        typeof examSubmissions
      >[] = results.flatMap((data) => {
        const examId = getExamsId(data.examName, examsData);
        if (!examId) {
          throw Error(`ID ujian ${data.examName} tidak ditemukan.`);
        }
        const submissionAttemptId = attemptMap.get(examId);

        if (!submissionAttemptId) {
          throw new Error(
            `Gagal menemukan submissionAttemptId untuk exam "${data.examName}"`,
          );
        }

        return data.answerResults.map((result) => ({
          submissionAttemptId,
          code: result.code,
          value: result.value,
          additionalValue: result.additionalValue,
          result: result.result,
        }));
      });
      await tx.insert(examSubmissions).values(examSubmissionsInsertValues);

      return {
        examEventId,
        submissionAttempt: nextAttempt,
        examSummary: results,
      };
    });

    return transactionResult;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return { error: error.message };
    }
    return { error: "Gagal mengumpulkan jawaban" };
  }
}

export async function getUserLatestExamResult(examEventId: string) {
  try {
    // 1. get userId
    const user = await validateSessionServer();
    const userId = user.session.userId;

    // 2. get latest submission
    const [{ latestAttempt }] = await db
      .select({
        latestAttempt: sql<number>`max(${submissionAttempts.numberAttempt})`,
      })
      .from(submissionAttempts)
      .where(
        and(
          eq(submissionAttempts.examEventId, examEventId),
          eq(submissionAttempts.userId, userId),
        ),
      );

    if (!latestAttempt) {
      return { error: "Anda belum pernah melakukan ujian." };
    }

    // 3. get all latest attempt data
    const rows = await db
      .select({
        id: submissionAttempts.id,
        examName: exams.examName,
        numberAttempt: submissionAttempts.numberAttempt,
        retake: submissionAttempts.retakeExam,
      })
      .from(submissionAttempts)
      .leftJoin(exams, eq(exams.id, submissionAttempts.examId))
      .where(
        and(
          eq(submissionAttempts.examEventId, examEventId),
          eq(submissionAttempts.userId, userId),
          eq(submissionAttempts.numberAttempt, latestAttempt),
        ),
      );

    return rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan hasil ujian" };
  }
}

export async function getUserLatestExamAttemptNumber(examEventId: string) {
  try {
    // 1. get userId
    const user = await validateSessionServer();
    const userId = user.session.userId;

    // 2. get latest submission
    const [{ latestAttempt }] = await db
      .select({
        latestAttempt: sql<number>`max(${submissionAttempts.numberAttempt})`,
      })
      .from(submissionAttempts)
      .where(
        and(
          eq(submissionAttempts.examEventId, examEventId),
          eq(submissionAttempts.userId, userId),
        ),
      );

    if (!latestAttempt) {
      return { latestAttempt: 0 };
    }

    return { latestAttempt };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan attempt number." };
  }
}

export async function getSubmissionSummary(
  examEventId: string,
  numberAttempt: number,
) {
  try {
    // 1. check if the person is admin
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    // 2. get latest submission
    const rows = await db
      .select({
        id: examSubmissions.id,
        username: user.username,
        name: user.name,
        departments: departments.departmentName,
        examName: exams.examName,
        code: examSubmissions.code,
        value: examSubmissions.value,
        result: examSubmissions.result,
        addValue: examSubmissions.additionalValue,
        note: examSubmissionNotes.note,
      })
      .from(examSubmissions)
      .leftJoin(
        submissionAttempts,
        eq(examSubmissions.submissionAttemptId, submissionAttempts.id),
      )
      .leftJoin(
        examSubmissionNotes,
        eq(submissionAttempts.id, examSubmissionNotes.submissionAttemptId),
      )
      .leftJoin(user, eq(submissionAttempts.userId, user.id))
      .leftJoin(departments, eq(user.departmentId, departments.id))
      .leftJoin(exams, eq(submissionAttempts.examId, exams.id))
      .where(
        and(
          eq(submissionAttempts.examEventId, examEventId),
          eq(submissionAttempts.numberAttempt, numberAttempt),
        ),
      );

    const examMap = new Map<
      string,
      {
        submission: Map<
          string,
          {
            list: {
              code: string;
              value: string;
              addValue: string | null;
              result: string;
            }[];
            note: string | null;
          }
        >;
      }
    >();

    for (const row of rows) {
      if (!row.examName) throw new Error("Exam name not found");
      if (!row.name) throw new Error("Participant name not found");

      let examGroup = examMap.get(row.examName);

      if (!examGroup) {
        examGroup = {
          submission: new Map(),
        };
        examMap.set(row.examName, examGroup);
      }

      let participant = examGroup.submission.get(row.name);

      if (!participant) {
        participant = {
          list: [],
          note: row.note ?? null, // participant-level note
        };
        examGroup.submission.set(row.name, participant);
      }

      participant.list.push({
        code: row.code,
        value: row.value,
        addValue: row.addValue,
        result: row.result,
      });
    }

    const finalData = Array.from(examMap, ([examName, examGroup]) => ({
      examName,
      submission: Array.from(
        examGroup.submission,
        ([participantName, { list, note }]) => ({
          participantName,
          list,
          note,
        }),
      ),
    }));

    return finalData;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
    return { error: "Gagal mendapatkan rangkuman hasil ujian." };
  }
}

export async function getSubmissionAttemptSummary(examEventId: string) {
  try {
    // 1. check if the person is admin
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    // get selectedExams data
    const [{ selectedExams }] = await db
      .select({ selectedExams: codeGroups.selectedExam })
      .from(examEvents)
      .leftJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
      .where(eq(examEvents.id, examEventId));

    if (!selectedExams) {
      return { error: "Daftar ujian tidak ditemukan." };
    }

    // get submission attempt summary
    const rows = await db
      .select({
        id: submissionAttempts.id,
        userId: user.id,
        username: user.username,
        name: user.name,
        departments: departments.departmentName,
        examName: exams.examName,
        numberAttempt: submissionAttempts.numberAttempt,
        grade: submissionAttempts.grade,
      })
      .from(submissionAttempts)
      .leftJoin(user, eq(submissionAttempts.userId, user.id))
      .leftJoin(departments, eq(user.departmentId, departments.id))
      .leftJoin(exams, eq(submissionAttempts.examId, exams.id))
      .where(eq(submissionAttempts.examEventId, examEventId));

    const groupName = normalizeExamSubmissions(rows, selectedExams);

    return { selectedExams, rowData: groupName };
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: error.message };
    }
    return { error: "Gagal mendapatkan rangkuman hasil ujian." };
  }
}

export interface SubmissionRow {
  id: string;
  userId: string | null;
  username: string | null;
  name: string | null;
  departments: string | null;
  examName: string | null;
  numberAttempt: number;
  grade: number | null;
}

export interface NormalizedExamData {
  userId: string;
  username: string;
  name: string;
  departments: string | null;
  // Dynamic keys for grades: ex:'identifikasi_1'
  [key: string]: string | number | null;
}

function normalizeExamSubmissions(
  rows: SubmissionRow[],
  selectedExams: string,
): NormalizedExamData[] {
  // 1. Parse the selectedExams string into an array of expected exam names
  const examTypes = selectedExams.split(",").map((exam) => exam.trim());

  // 2. Initialize a Map to group the data by userId (which must be a non-null string)
  const normalizedDataMap = new Map<string, NormalizedExamData>();

  // 3. Process each row
  for (const row of rows) {
    const {
      userId,
      username,
      name,
      departments,
      examName,
      numberAttempt,
      grade,
    } = row;

    // A submission cannot be grouped or mapped without a valid user ID or exam name.
    if (
      userId === null ||
      username === null ||
      name === null ||
      examName === null
    ) {
      throw Error(`Terdapat data null yang seharusnya tidak ada.`);
    }

    // Ensure the examName is one of the expected types for the event
    if (!examTypes.includes(examName)) {
      throw Error(`${examName} tidak ada dalam list (${examTypes})`);
    }

    // Initialize the user's data entry if it doesn't exist
    if (!normalizedDataMap.has(userId)) {
      const initialEntry: NormalizedExamData = {
        userId,
        username,
        name,
        departments,
      };

      // Pre-fill all 4 expected attempt columns for all selected exam types with null
      for (const type of examTypes) {
        for (let i = 1; i <= 4; i++) {
          initialEntry[`${type}_${i}`] = null;
        }
      }
      normalizedDataMap.set(userId, initialEntry);
    }

    // Get the current user's entry
    const userData = normalizedDataMap.get(userId)!;

    // Check if the attempt number is within the expected range (1 to 4)
    if (numberAttempt >= 1 && numberAttempt <= 4) {
      // Construct the dynamic key and assign the grade (which can be null)
      const key = `${examName}_${numberAttempt}`;
      userData[key] = grade;
    } else {
      throw Error("Terdapat user dengan number attempt < 1 && > 4 ");
    }
  }

  // 4. Convert the Map values back to an array
  const results = Array.from(normalizedDataMap.values());

  return calculateExamResultsWithCompletionCheck(results, examTypes);
}

function calculateExamResultsWithCompletionCheck(
  normalizedData: NormalizedExamData[],
  examTypes: string[],
): NormalizedExamData[] {
  const PASSING_THRESHOLD = 70;
  const NUM_ATTEMPTS = 4;

  const resultsWithCalculations: NormalizedExamData[] = [];

  for (const item of normalizedData) {
    const sumOfBestGrades = 0;
    let bestGradeMetCount = 0; // Counts exams where best grade >= 70
    let maxAttemptsMetCount = 0; // Counts exams where 4 attempts were made

    // Storage for the best grade found for each exam to calculate the average later
    const bestGrades: (number | null)[] = [];

    // 1. Check Completion Criteria
    for (const examType of examTypes) {
      let bestGradeForExam: number | null = null;
      let attemptCount = 0;

      // Find the best grade and total attempts across the 4 slots
      for (let i = 1; i <= NUM_ATTEMPTS; i++) {
        const key = `${examType}_${i}`;
        const currentGrade = item[key] as number | null;

        if (currentGrade !== null) {
          attemptCount++;
          // Find the best grade
          if (bestGradeForExam === null || currentGrade > bestGradeForExam) {
            bestGradeForExam = currentGrade;
          }
        }
      }

      // Store the best grade for calculation later, regardless of completion status
      bestGrades.push(bestGradeForExam);

      // Check if the best grade meets the passing threshold (Criterion 1)
      if (bestGradeForExam !== null && bestGradeForExam >= PASSING_THRESHOLD) {
        bestGradeMetCount++;
      }

      // Check if max attempts were submitted (Criterion 2)
      if (attemptCount === NUM_ATTEMPTS) {
        maxAttemptsMetCount++;
      }
    }

    // 2. Determine if Completion State is reached
    const hasPassedAll = bestGradeMetCount === examTypes.length;
    const hasMaxedAttempts = maxAttemptsMetCount === examTypes.length;

    // The calculation is performed ONLY if either condition is met
    if (hasPassedAll || hasMaxedAttempts) {
      // 3. Calculate Average Grade (using the best grade found for each exam)
      let sumOfFinalGrades = 0;
      let gradesUsedInAverage = 0;

      for (const grade of bestGrades) {
        if (grade !== null) {
          sumOfFinalGrades += grade;
          gradesUsedInAverage++;
        }
      }

      let averageGradeValue = 0;
      if (examTypes.length > 0) {
        // The average is calculated based on the sum of the best grade for each exam
        // divided by the total number of required exam types (which is 3).
        averageGradeValue = sumOfFinalGrades / examTypes.length;
      }

      // 4. Set the calculated fields
      item.averageGrade = averageGradeValue.toFixed(2);

      if (averageGradeValue >= PASSING_THRESHOLD) {
        item.result = "LULUS";
      } else {
        item.result = "TIDAK LULUS";
      }
    } else {
      item.averageGrade = null;
      item.result = null;
    }
    // 5. If the completion state is not met, the fields are naturally omitted or left as defaults
    // depending on how the initial object was built. Since the prompt implies adding them,
    // they will be missing here if the condition is false.

    resultsWithCalculations.push(item);
  }

  return resultsWithCalculations;
}
