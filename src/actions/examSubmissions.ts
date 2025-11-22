"use server";

import { db } from "@/db";
import {
  examEvents,
  examRegistrations,
  examSubmissions,
  submissionAttemps,
} from "@/db/schema/examEvents";
import { Answer } from "@/lib/types";
import { getAllExams } from "./exams";
import { getExamsId } from "@/lib/utils";
import { codeGroups, codes, exams } from "@/db/schema";
import { evaluateAnswers } from "@/lib/evaluateAnswer";
import { validateSessionServer } from "./validateSession";
import { and, eq, InferInsertModel, or, sql } from "drizzle-orm";

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

    const transactionResult = await db.transaction(async (tx) => {
      // 3. check how many time user already submit exam
      const [{ latestAttempt }] = await tx
        .select({
          latestAttempt: sql<number>`max(${submissionAttemps.numberAttemp})`,
        })
        .from(submissionAttemps)
        .where(
          and(
            eq(submissionAttemps.examEventId, Number(examEventId)),
            eq(submissionAttemps.userId, userId),
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
            eq(examEvents.id, Number(examEventId)),
            eq(examRegistrations.userId, userId),
          ),
        );

      // 5. get selectedExam based on user number of submission attempt
      let selectedExam: string = "";

      if (nextAttempt > 1) {
        const rows = await tx
          .select({ retakeExam: submissionAttemps.retakeExam })
          .from(submissionAttemps)
          .where(
            and(
              eq(submissionAttemps.numberAttemp, nextAttempt - 1),
              eq(submissionAttemps.examEventId, Number(examEventId)),
              eq(submissionAttemps.userId, userId),
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
      }));

      const normalizedPairs = submittedExamData.map((data) => ({
        examName: data.examName.toLowerCase(),
        code: data.code.toLowerCase(),
      }));

      const orConditions = normalizedPairs.map((pair) =>
        and(
          eq(sql`lower(${exams.examName})`, pair.examName),
          eq(sql`lower(${codes.code})`, pair.code),
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
        .where(
          and(eq(codes.codeGroupId, Number(codeGroupId)), or(...orConditions)),
        );

      // 8. evaluate answer list by comparing userAnswerList and dbAnswerList.
      // then give result either "correct" | "partial" | "wrong"
      // @ts-expect-error correct answer actually work (null and undefined)
      const results = evaluateAnswers(submittedExamData, dbAnswerList);

      // 9. insert submissionAttemps data
      const submissionAttempsInsertValues: InferInsertModel<
        typeof submissionAttemps
      >[] = results.map((data) => ({
        numberAttemp: nextAttempt,
        examEventId: Number(examEventId),
        userId,
        examId: getExamsId(data.examName, examsData!),
        grade: data.grade,
        retakeExam: data.grade < 70 ? data.examName : "",
      }));
      await tx.insert(submissionAttemps).values(submissionAttempsInsertValues);

      // 10. get submissionAttemps inserted rows data
      const insertedRows = await tx
        .select({ id: submissionAttemps.id, examId: submissionAttemps.examId })
        .from(submissionAttemps)
        .where(
          and(
            eq(submissionAttemps.examEventId, Number(examEventId)),
            eq(submissionAttemps.numberAttemp, nextAttempt),
          ),
        );

      // 11. insert examSubmissions data
      const attemptMap = new Map<number, number>();
      for (const row of insertedRows) {
        attemptMap.set(row.examId, row.id);
      }

      const examSubmissionsInsertValues: InferInsertModel<
        typeof examSubmissions
      >[] = results.flatMap((data) => {
        const examId = getExamsId(data.examName, examsData!);
        const submissionAttemptId = attemptMap.get(examId);

        if (!submissionAttemptId) {
          throw new Error(
            `Gagal menemukan submissionAttemptId untuk exam "${data.examName}"`,
          );
        }

        return data.answerResults.map((result) => ({
          userId,
          code: result.code,
          value: result.value,
          additionalValue: result.additionalValue,
          result: result.result,
          examId: getExamsId(result.examName, examsData!),
          examEventId: Number(examEventId),
          codeGroupId: codeGroupId!,
          submissionAttemptId,
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
    console.error(error);
    return { error: "Gagal mengumpulkan jawaban" };
  }
}

export async function getUserLatestExamResult(examEventId: number) {
  try {
    // 1. get userId
    const user = await validateSessionServer();
    const userId = user.session.userId;

    // 2. get latest submission
    const [{ latestAttempt }] = await db
      .select({
        latestAttempt: sql<number>`max(${submissionAttemps.numberAttemp})`,
      })
      .from(submissionAttemps)
      .where(
        and(
          eq(submissionAttemps.examEventId, Number(examEventId)),
          eq(submissionAttemps.userId, userId),
        ),
      );

    if (!latestAttempt) {
      return { error: "Anda belum pernah melakukan ujian." };
    }

    // 3. get all latest attempt data
    const rows = await db
      .select({
        id: submissionAttemps.id,
        examName: exams.examName,
        numberAttempt: submissionAttemps.numberAttemp,
        grade: submissionAttemps.grade,
        retake: submissionAttemps.retakeExam,
      })
      .from(submissionAttemps)
      .leftJoin(exams, eq(exams.id, submissionAttemps.examId))
      .where(
        and(
          eq(submissionAttemps.examEventId, Number(examEventId)),
          eq(submissionAttemps.userId, userId),
          eq(submissionAttemps.numberAttemp, latestAttempt),
        ),
      );

    return rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan hasil ujian" };
  }
}

export async function getUserLatestExamAttemptNumber(examEventId: number) {
  try {
    // 1. get userId
    const user = await validateSessionServer();
    const userId = user.session.userId;

    // 2. get latest submission
    const [{ latestAttempt }] = await db
      .select({
        latestAttempt: sql<number>`max(${submissionAttemps.numberAttemp})`,
      })
      .from(submissionAttemps)
      .where(
        and(
          eq(submissionAttemps.examEventId, Number(examEventId)),
          eq(submissionAttemps.userId, userId),
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
