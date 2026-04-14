"use server";

import { db } from "@/db";
import {
  examEvents,
  examRegistrations,
  sampleExamAnswer,
  submissionAttempts,
} from "@/db/schema/examEvents";
import { shuffle } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { codeGroups, codes, exams } from "@/db/schema";
import { wibInputToUtcISOString } from "@/lib/datetimeFormat";
import { isValidRole, validateSessionServer } from "./validateSession";
import { and, desc, eq, gte, inArray, like, lte, sql } from "drizzle-orm";

export async function addExamEvent(formData: FormData) {
  const eventName = (formData.get("event-name") as string).trim();
  const codeGroupExam = formData.getAll("code-group-exam") as string[];
  const eventStartDate = formData.get("event-start-date") as string;
  const eventStartTime = formData.get("event-start-time") as string;
  const eventEndDate = formData.get("event-end-date") as string;
  const eventEndTime = formData.get("event-end-time") as string;

  if (
    !eventName ||
    codeGroupExam.length !== 2 ||
    !eventStartDate ||
    !eventStartTime ||
    !eventEndDate ||
    !eventEndTime
  ) {
    return { error: "Lengkapi semua data pendaftaran ujian." };
  }

  const examStart = wibInputToUtcISOString(eventStartDate, eventStartTime);
  const examEnd = wibInputToUtcISOString(eventEndDate, eventEndTime);

  // exam end must be after exam start
  if (examEnd <= examStart) {
    return {
      error: "Tanggal/waktu pelaksanaan selesai harus setelah ujian dimulai.",
    };
  }

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const newEvent = await db.insert(examEvents).values({
      examEventName: eventName,
      codeGroupRegulerId: codeGroupExam[0],
      codeGroupRetakeId: codeGroupExam[1],
      examStart,
      examEnd,
    });

    if (newEvent.rowsAffected === 0) {
      return {
        error: "Gagal membuat pendaftaran baru.",
      };
    }

    revalidatePath("/dashboard/ujian");
    return newEvent.rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal membuat pendaftaran baru." };
  }
}

export async function updateExamEvent(formData: FormData, examEventId: string) {
  const eventName = (formData.get("event-name") as string).trim();
  const eventStartDate = formData.get("event-start-date") as string;
  const eventStartTime = formData.get("event-start-time") as string;
  const eventEndDate = formData.get("event-end-date") as string;
  const eventEndTime = formData.get("event-end-time") as string;

  if (
    !eventName ||
    !eventStartDate ||
    !eventStartTime ||
    !eventEndDate ||
    !eventEndTime
  ) {
    return { error: "Lengkapi semua data pendaftaran ujian." };
  }

  const examStart = wibInputToUtcISOString(eventStartDate, eventStartTime);
  const examEnd = wibInputToUtcISOString(eventEndDate, eventEndTime);

  // exam end must be after exam start
  if (examEnd <= examStart) {
    return {
      error: "Tanggal/waktu pelaksanaan selesai harus setelah ujian dimulai.",
    };
  }

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const updatedEvent = await db
      .update(examEvents)
      .set({
        examEventName: eventName,
        examStart,
        examEnd,
      })
      .where(eq(examEvents.id, examEventId));

    if (updatedEvent.rowsAffected === 0) {
      return {
        error: "Gagal memperbarui waktu ujian.",
      };
    }

    revalidatePath("/dashboard/ujian");
    return updatedEvent.rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal memperbarui waktu ujian." };
  }
}

export async function deleteExamEvent(examEventId: string) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const result = await db
      .delete(examEvents)
      .where(eq(examEvents.id, examEventId));

    revalidatePath("/dashboard/ujian");
    return result.rows;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Gagal menghapus acara ujian" };
  }
}

export async function getActiveExamEvent() {
  try {
    // current jakarta datetime
    const now = new Date(); // always current UTC-based time
    const jakartaTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const currentDateTime = jakartaTime.toISOString();

    // 1. get current user username (nik)
    const session = await validateSessionServer();
    const userId = session.user.id;

    // 2. get all active exams
    const rows = await db
      .select({
        examEventId: examEvents.id,
        examEventName: examEvents.examEventName,
        examStart: examEvents.examStart,
        examEnd: examEvents.examEnd,
        selectedExam: codeGroups.selectedExam,
      })
      .from(examRegistrations)
      .innerJoin(examEvents, eq(examRegistrations.examEventId, examEvents.id))
      .innerJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
      .where(
        and(
          eq(examRegistrations.userId, userId),
          lte(examEvents.examStart, currentDateTime),
          gte(examEvents.examEnd, currentDateTime),
        ),
      );

    if (rows.length === 0) return [];

    // 3. find latest attempt of each founded exam
    const listExamEventId = rows.map((row) => row.examEventId);
    const latestAttempts = db
      .select({
        examEventId: submissionAttempts.examEventId,
        maxAttempt: sql<number>`max(${submissionAttempts.numberAttempt})`.as(
          "maxAttempt",
        ),
      })
      .from(submissionAttempts)
      .where(eq(submissionAttempts.userId, userId))
      .groupBy(submissionAttempts.examEventId)
      .as("latestAttempts");

    const latestAttemptRows = await db
      .select({
        examEventId: submissionAttempts.examEventId,
        numberAttempt: submissionAttempts.numberAttempt,
        retakeExam: submissionAttempts.retakeExam,
      })
      .from(submissionAttempts)
      .innerJoin(
        latestAttempts,
        and(
          eq(submissionAttempts.examEventId, latestAttempts.examEventId),
          eq(submissionAttempts.numberAttempt, latestAttempts.maxAttempt),
        ),
      )
      .where(
        and(
          inArray(submissionAttempts.examEventId, listExamEventId),
          eq(submissionAttempts.userId, userId),
        ),
      );

    // 4. add numberAttempt and retakeExam filed to the active exam event data
    const attemptMap = new Map<string, typeof latestAttemptRows>();
    for (const attempt of latestAttemptRows) {
      const existing = attemptMap.get(attempt.examEventId) ?? [];
      existing.push(attempt);
      attemptMap.set(attempt.examEventId, existing);
    }

    const completeData = rows.map((row) => {
      const attempts = attemptMap.get(row.examEventId) ?? [];
      const latest = attempts[0];
      return {
        ...row,
        numberAttempt: latest?.numberAttempt ?? 0,
        retakeExam: attempts
          .filter((a) => a.retakeExam)
          .map((a) => a.retakeExam)
          .join(","),
      };
    });

    return completeData;
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data ujian aktif." };
  }
}

export async function getExamEventById(examEventId: string) {
  try {
    const rows = await db
      .select({
        id: examEvents.id,
        examEventName: examEvents.examEventName,
        examStart: examEvents.examStart,
        examEnd: examEvents.examEnd,
        codeGroupRegulerId: examEvents.codeGroupRegulerId,
        codeGroupRetakeId: examEvents.codeGroupRetakeId,
        createdAt: examEvents.createdAt,
        updatedAt: examEvents.updatedAt,
        selectedExams: codeGroups.selectedExam,
        totalParticipants: codeGroups.totalParticipants,
      })
      .from(examEvents)
      .innerJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
      .where(and(eq(examEvents.id, examEventId)));

    if (rows.length === 0) {
      return { error: `Tidak ada ujian dengan id ${examEventId}` };
    }

    return rows[0];
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data ujian aktif." };
  }
}

export async function getAllExamEvents(page: number = 1, search?: string) {
  const limit = 12;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(like(examEvents.examEventName, `%${search}%`));

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(examEvents)
      .innerJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
      .where(conditions.length ? and(...conditions) : undefined);

    const data = await db
      .select({
        id: examEvents.id,
        examEventName: examEvents.examEventName,
        examStart: examEvents.examStart,
        examEnd: examEvents.examEnd,
        codeGroupRegulerId: examEvents.codeGroupRegulerId,
        codeGroupRetakeId: examEvents.codeGroupRetakeId,
        createdAt: examEvents.createdAt,
        updatedAt: examEvents.updatedAt,
        selectedExams: codeGroups.selectedExam,
        totalParticipants: codeGroups.totalParticipants,
      })
      .from(examEvents)
      .innerJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(examEvents.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      page,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan daftar pelaksanaan ujian." };
  }
}

// this is for drop down list "identifikasi" || "2 out of 5"
export async function getListValuesFromExamName(
  examName: string,
  eventId: string,
) {
  try {
    const transactionResult = await db.transaction(async (tx) => {
      const getCorrectValue = tx
        .selectDistinct({
          value: examName.includes("2 out of 5")
            ? codes.additionalValue
            : codes.value,
        })
        .from(examEvents)
        .rightJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
        .leftJoin(codes, eq(codes.codeGroupId, codeGroups.id))
        .leftJoin(exams, eq(codes.examId, exams.id))
        .where(and(eq(examEvents.id, eventId), eq(exams.examName, examName)));

      const getSampleValue = tx
        .selectDistinct({ value: sampleExamAnswer.value })
        .from(sampleExamAnswer)
        .where(
          and(
            eq(sampleExamAnswer.examEventId, eventId),
            eq(sampleExamAnswer.examName, examName),
          ),
        );

      const [correct, sample] = await Promise.all([
        getCorrectValue,
        getSampleValue,
      ]);

      const correctArr = correct.map((data) => data.value);
      const sampleArr = sample.map((data) => data.value);

      return shuffle([...correctArr, ...sampleArr]);
    });

    return transactionResult;
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data." };
  }
}

export async function getExamInputFormBasedOnSelectedExamForm(
  examEventId: string,
) {
  try {
    // 1. get userId
    const session = await validateSessionServer();
    const userId = session.user.id;

    const validExams = await getExamEventById(examEventId);
    if ("error" in validExams) {
      return { error: validExams.error };
    }

    const transactionResult = await db.transaction(async (tx) => {
      // 2. get latestAttempt number
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

      // 3. get codeGroupId based on how many times user already take
      const nextAttempt = (latestAttempt ?? 0) + 1;
      if (nextAttempt > 4) {
        throw new Error("Kesempatan perbaikan ujian anda sudah habis.");
      }

      // 4. get selectedExam based on user number of submission attempt
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
        const [{ selectedExamForFirstTimeExam }] = await tx
          .select({
            selectedExamForFirstTimeExam: codeGroups.selectedExam,
          })
          .from(examEvents)
          .leftJoin(
            codeGroups,
            eq(examEvents.codeGroupRegulerId, codeGroups.id),
          )
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
        selectedExam = selectedExamForFirstTimeExam ?? "";
      }

      return selectedExam;
    });

    return { selectedExams: transactionResult };
  } catch (error) {
    console.error(error);
    return { error: "Kesempatan ujian sudah habis." };
  }
}

export async function getExamValueFromExamEvent(
  examName: string,
  examEventId: string,
) {
  try {
    const rows = await db
      .selectDistinct({
        value: codes.value,
        addValue: codes.additionalValue,
      })
      .from(codes)
      .leftJoin(codeGroups, eq(codes.codeGroupId, codeGroups.id))
      .leftJoin(examEvents, eq(examEvents.codeGroupRegulerId, codeGroups.id))
      .leftJoin(exams, eq(codes.examId, exams.id))
      .where(and(eq(exams.examName, examName), eq(examEvents.id, examEventId)));

    const valueWithAddValue = rows.map((data) =>
      data.addValue ? `${data.value} ${data.addValue}` : data.value,
    );

    return valueWithAddValue.sort();
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return {
      error: `Gagal mendapatkan daftar jawaban untuk ujian ${examName}`,
    };
  }
}

export async function getExamThatNeedDummyData(examEventId: string) {
  try {
    // TODO: get the examValue
    const [row] = await db
      .selectDistinct({
        selectedExams: codeGroups.selectedExam,
      })
      .from(examEvents)
      .leftJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
      .where(eq(examEvents.id, examEventId));

    const exams = ["2 out of 5 creamer", "2 out of 5 pure", "identifikasi"];

    const filteredExams = row.selectedExams
      ?.split(",")
      .filter((examName) => exams.some((exam) => exam === examName));

    if (!filteredExams) {
      return {
        error: "Tidak ditemukan ujian yang membutuhkan jawaban tambahan.",
      };
    }

    return filteredExams.map((exam) => ({
      examName: exam,
    }));
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data daftar ujian" };
  }
}

export async function addSampleExamAnswer(
  examEventId: string,
  sample: string,
  examName: string,
) {
  try {
    const results = await db
      .insert(sampleExamAnswer)
      .values({ value: sample, examEventId, examName });

    return { rowsAffected: results.rowsAffected };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data daftar ujian" };
  }
}

export async function getSampleExamAnswer(
  examEventId: string,
  examName: string,
) {
  try {
    const rows = await db
      .select()
      .from(sampleExamAnswer)
      .where(
        and(
          eq(sampleExamAnswer.examEventId, examEventId),
          eq(sampleExamAnswer.examName, examName),
        ),
      );

    return rows.map((row) => row.value);
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data daftar ujian" };
  }
}

export async function deleteSampleExamAnswer(
  examEventId: string,
  examName: string,
  value: string,
) {
  try {
    const rows = await db
      .delete(sampleExamAnswer)
      .where(
        and(
          eq(sampleExamAnswer.examEventId, examEventId),
          eq(sampleExamAnswer.examName, examName),
          eq(sampleExamAnswer.value, value),
        ),
      );

    return { rowsAffected: rows.rowsAffected };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data daftar ujian" };
  }
}
