"use server";

import { db } from "@/db";
import {
  examEvents,
  examSubmissionNotes,
  examSubmissions,
  submissionAttempts,
} from "@/db/schema/examEvents";
import { getAllExams } from "./exams";
import { getExamsId } from "@/lib/utils";
import { evaluateAnswers } from "@/lib/evaluateAnswer";
import { hasNoDuplicates } from "@/lib/submissionValidation";
import { AllTypeOfAnswer, AnswerKeys, ExamName } from "@/lib/types";
import { isValidRole, validateSessionServer } from "./validateSession";
import { and, between, eq, InferInsertModel, or, sql } from "drizzle-orm";
import { codeGroups, codes, departments, exams, user } from "@/db/schema";

type NewSubmissionAttempt = InferInsertModel<typeof submissionAttempts>;
type NewExamSubmission = InferInsertModel<typeof examSubmissions>;
type NewExamSubmissionNote = InferInsertModel<typeof examSubmissionNotes>;

export async function submitExam(
  submittedExamData: AllTypeOfAnswer[],
  examEventId: string,
) {
  try {
    // 1. get user id;
    const session = await validateSessionServer();
    const userId = session.user.id;
    if (!userId) {
      return { error: "User tidak ditemukan" };
    }

    // 2. ensure all codes and product names across exam sections are unique
    const allInputIsUnique = hasNoDuplicates(submittedExamData);
    if (!allInputIsUnique) {
      return {
        error:
          "Kode atau nama produk yang dimasukkan tidak boleh ada duplikasi.",
      };
    }

    const getLatestAttempt = db
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
    const getCodeGroup = db
      .select({
        regulerId: examEvents.codeGroupRegulerId,
        retakeId: examEvents.codeGroupRetakeId,
      })
      .from(examEvents)
      .where(eq(examEvents.id, examEventId));

    // 3. get all exams data from db, user latest attempt and examEventCodeGroups
    const [examsData, [{ latestAttempt }], codeGroup] = await Promise.all([
      getAllExams(),
      getLatestAttempt,
      getCodeGroup,
    ]);

    if (!examsData) {
      return { error: "Gagal mendapatkan daftar nama ujian" };
    }
    const currentAttempt = (latestAttempt ?? 0) + 1;
    if (currentAttempt > 4) {
      throw new Error("Kesempatan perbaikan ujian anda sudah habis.");
    }
    if (codeGroup.length === 0) {
      throw new Error(`Tidak ditemukan ujian dengan ID "${examEventId}".`);
    }

    // 4. if codeGroupReguler and codeGroupRetake is the same, only check submissionAttemptId
    const isSameCodeGroup = codeGroup[0].regulerId === codeGroup[0].retakeId;
    const whereClause = isSameCodeGroup
      ? eq(submissionAttempts.examEventId, examEventId)
      : and(
          eq(submissionAttempts.examEventId, examEventId),
          currentAttempt === 1 // attempt 1 uses codeGroupReguler, attempt > 1 uses codeGroupRetake
            ? eq(submissionAttempts.numberAttempt, currentAttempt)
            : between(submissionAttempts.numberAttempt, 2, currentAttempt),
        );

    // 5. verify that none of the code in this submission has been submitted before
    const alreadySubmittedCodes = await db
      .select({ code: examSubmissions.code })
      .from(examSubmissions)
      .innerJoin(
        submissionAttempts,
        eq(examSubmissions.submissionAttemptId, submissionAttempts.id),
      )
      .where(whereClause);

    const newCodes = new Set(submittedExamData.map((d) => d.code));
    const hasOverlappingCodes = alreadySubmittedCodes.some((d) =>
      newCodes.has(d.code),
    );

    if (hasOverlappingCodes) {
      throw new Error(
        `Gagal mengumpulkan jawaban, terdapat kode yang sudah pernah dikumpulkan sebelumnya.`,
      );
    }

    // 6. get selectedExam and codeGroupId based on user number of submission attempt
    let selectedExam: string[] = [];
    let selectedCodeGroupId: string = "";

    if (currentAttempt === 1) {
      const [{ selectedExamForFirstTimeExam }] = await db
        .select({
          selectedExamForFirstTimeExam: codeGroups.selectedExam,
        })
        .from(examEvents)
        .innerJoin(codeGroups, eq(codeGroups.id, examEvents.codeGroupRegulerId))
        .where(eq(examEvents.id, examEventId));
      if (!selectedExamForFirstTimeExam) {
        throw new Error("Gagal mendapatkan daftar ujian");
      }
      selectedExam = selectedExamForFirstTimeExam.split(",") ?? [];
      selectedCodeGroupId = codeGroup[0].regulerId ?? "";
    } else {
      const rows = await db
        .select({ retakeExam: submissionAttempts.retakeExam })
        .from(submissionAttempts)
        .where(
          and(
            eq(submissionAttempts.numberAttempt, currentAttempt - 1),
            eq(submissionAttempts.examEventId, examEventId),
            eq(submissionAttempts.userId, userId),
          ),
        );
      const selectedExamForRetakeExam = rows
        .map((data) => data.retakeExam)
        .filter((exam) => exam && exam.length > 0)
        .toString();
      selectedExam = selectedExamForRetakeExam.split(",") || [];
      selectedCodeGroupId = codeGroup[0].retakeId ?? "";
    }

    // 7. filter input data to only get current selected exam
    submittedExamData = submittedExamData.filter((data) =>
      selectedExam.some((exam) => exam.includes(data.examName)),
    );
    submittedExamData = submittedExamData.map((data) => ({
      ...data,
      code: data.code ? data.code : "",
      value: data.value ? data.value : "",
      attemptNumber: currentAttempt,
      note: data.note ? data.note : "",
    }));
    const orConditions = submittedExamData.map((pair) =>
      and(
        eq(exams.examName, pair.examName.toLowerCase()),
        eq(codes.code, pair.code),
      ),
    );
    // 8. get dbAnswerList based on submittedExamData and selectedCodeGroupId
    const dbAnswerList = await db
      .select({
        examName: exams.examName,
        code: codes.code,
        value: codes.value,
        additionalValue: codes.additionalValue,
      })
      .from(codes)
      .leftJoin(exams, eq(codes.examId, exams.id))
      .where(
        and(eq(codes.codeGroupId, selectedCodeGroupId), or(...orConditions)),
      );

    // 9. evaluate answer list by comparing userAnswerList and dbAnswerList.
    // then give result either "correct" | "partial" | "wrong"
    const results = evaluateAnswers(
      submittedExamData,
      dbAnswerList as AnswerKeys[],
    );

    let finalTresholdGrade = 0;
    if (selectedExam.some((exam) => exam.toLowerCase().includes("treshold"))) {
      // 10. find final treshold (tmx + tsg (skor + rasa)) final grade avarege
      const findTreshold = results.filter((data) =>
        data.examName.toLowerCase().includes("treshold"),
      );
      finalTresholdGrade = findTreshold.reduce((acc, curr) => {
        const additionalGrade = curr.additionalGrade ? curr.additionalGrade : 0;
        return acc + curr.grade + additionalGrade;
      }, 0);
      // NB : this calculation follow combineTresholdData();
      finalTresholdGrade = finalTresholdGrade / 3; // tresholdSingle (rasa + skor) + tresholdMix
    }

    // 10. build values submissionAttempts, examSubmissions, and submissionNote values
    // a. build submissionAttempts values
    // b. build examSubmissions values
    // c. build examSubmissionNotes values for skoring/triangle exam
    const submissionAttemptsValues: NewSubmissionAttempt[] = [];
    const examSubmissionsValues: NewExamSubmission[] = [];
    const examSubmissionNotesValues: NewExamSubmissionNote[] = [];
    for (const data of results) {
      const examId = getExamsId(data.examName, examsData);
      if (!examId) {
        throw new Error("ID ujian tidak ditemukan.");
      }
      const submissionAttemptId = crypto.randomUUID();

      // if final trehsold (tmx + tsg (skor + rasa)) avarege grade < 70,
      // all treshold (tmx + tsg (skor + rasa)) must be retaken
      const isThresholdFail =
        data.examName.toLowerCase().includes("treshold") &&
        finalTresholdGrade < 70;
      const isGradeFail = data.grade < 70;
      const isRetake = isThresholdFail || isGradeFail ? data.examName : "";

      submissionAttemptsValues.push({
        id: submissionAttemptId,
        numberAttempt: currentAttempt,
        examEventId,
        userId,
        examId,
        grade: data.grade,
        additionalGrade: data?.additionalGrade,
        retakeExam: isRetake,
      });
      examSubmissionsValues.push(
        ...data.answerResults.map((result) => ({
          submissionAttemptId,
          code: result.code,
          value: result.value,
          additionalValue: result.additionalValue,
          result: result.result,
          additionalResult: result.additionalResult,
        })),
      );
      if (data.note) {
        // this data for insert examSubmissionNotes for skoring/triangle exam
        examSubmissionNotesValues.push({
          submissionAttemptId,
          note: data.note.trim(),
        });
      }
    }

    const transactionResult = await db.transaction(async (tx) => {
      // 10. insert submissionAttempts data
      await tx.insert(submissionAttempts).values(submissionAttemptsValues);
      // 11. insert examSubmissions data
      await tx.insert(examSubmissions).values(examSubmissionsValues);
      // 12. insert submissionNote only if relevant exams (skoring/triangle) are selected and notes exist.
      const isNoteExam = ["skoring", "triangle"].some((exam) =>
        selectedExam.includes(exam),
      );
      if (isNoteExam && examSubmissionNotesValues.length !== 0) {
        await tx.insert(examSubmissionNotes).values(examSubmissionNotesValues);
      }

      return {
        examEventId,
        submissionAttempt: currentAttempt,
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
    const [{ latestAttempt, examEventName }] = await db
      .select({
        latestAttempt: sql<number>`max(${submissionAttempts.numberAttempt})`,
        examEventName: examEvents.examEventName,
      })
      .from(submissionAttempts)
      .leftJoin(examEvents, eq(examEvents.id, submissionAttempts.examEventId))
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

    return {
      examEventName,
      examResults: rows,
    };
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
        additionalResult: examSubmissions.additionalResult,
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
              additionalResult: string | null;
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
        additionalResult: row.additionalResult,
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
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    // get selectedExams data
    const getSelectedExams = db
      .select({ selectedExams: codeGroups.selectedExam })
      .from(examEvents)
      .leftJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
      .where(eq(examEvents.id, examEventId));

    // get submission attempt summary
    const getSubmissionSummary = db
      .select({
        id: submissionAttempts.id,
        userId: user.id,
        username: user.username,
        name: user.name,
        departments: departments.departmentName,
        examName: exams.examName,
        numberAttempt: submissionAttempts.numberAttempt,
        grade: submissionAttempts.grade,
        additionalGrade: submissionAttempts.additionalGrade,
      })
      .from(submissionAttempts)
      .leftJoin(user, eq(submissionAttempts.userId, user.id))
      .leftJoin(departments, eq(user.departmentId, departments.id))
      .leftJoin(exams, eq(submissionAttempts.examId, exams.id))
      .where(eq(submissionAttempts.examEventId, examEventId));

    const [[{ selectedExams }], submissionSummary] = await Promise.all([
      getSelectedExams,
      getSubmissionSummary,
    ]);

    if (!selectedExams) {
      return { error: "Daftar ujian tidak ditemukan." };
    }
    const groupName =
      submissionSummary.length !== 0
        ? normalizeExamSubmissions(submissionSummary, selectedExams)
        : [];

    return {
      selectedExams: selectedExams.split(",") as ExamName[],
      rowData: groupName,
    };
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
  additionalGrade: number | null;
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
      additionalGrade,
    } = row;

    // A submission cannot be grouped or mapped without a valid user ID or exam name.
    if (
      userId === null ||
      username === null ||
      name === null ||
      examName === null
    ) {
      throw new Error(`Terdapat data null yang seharusnya tidak ada.`);
    }

    // Ensure the examName is one of the expected types for the event
    if (!examTypes.includes(examName)) {
      throw new Error(`${examName} tidak ada dalam list (${examTypes})`);
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
          if (type === "treshold single") {
            initialEntry[`${type}_${i}_additional`] = null;
          }
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

      // add additional grade for treshold mix exam (rasa + skor) cell table
      if (examName === "treshold single") {
        const additionalKey = `${examName}_${numberAttempt}_additional`;
        userData[additionalKey] = additionalGrade;
      }
    } else {
      throw new Error("Terdapat user dengan number attempt < 1 && > 4 ");
    }
  }

  // 4. Convert the Map values back to an array
  const results = Array.from(normalizedDataMap.values());

  return results;
}
