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

    const examEventValue = {
      examEventName: eventName,
      codeGroupRegulerId: codeGroupExam[0],
      codeGroupRetakeId: codeGroupExam[1],
      examStart,
      examEnd,
    };

    const [newEvent] = await db.insert(examEvents).values(examEventValue);

    if (newEvent.affectedRows === 0) {
      return {
        error: "Gagal membuat pendaftaran baru.",
      };
    }

    revalidatePath("/dashboard/ujian");
    return { id: newEvent.insertId, ...examEventValue };
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

    const examEventUpdateValue = {
      examEventName: eventName,
      examStart,
      examEnd,
    };

    const [updatedEvent] = await db
      .update(examEvents)
      .set(examEventUpdateValue)
      .where(eq(examEvents.id, examEventId));

    if (updatedEvent.affectedRows === 0) {
      return {
        error: "Gagal memperbarui waktu ujian.",
      };
    }

    revalidatePath("/dashboard/ujian");
    return { id: updatedEvent.insertId, ...examEventUpdateValue };
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

    const [result] = await db
      .delete(examEvents)
      .where(eq(examEvents.id, examEventId));

    revalidatePath("/dashboard/ujian");
    return { id: result.insertId };
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

    const getTotal = db
      .select({ count: sql<number>`count(*)` })
      .from(examEvents)
      .innerJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
      .where(conditions.length ? and(...conditions) : undefined);

    const getData = db
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

    const [[{ count }], data] = await Promise.all([getTotal, getData]);

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
  examEventId: string,
) {
  try {
    const getSampleValue = db
      .selectDistinct({ value: sampleExamAnswer.value })
      .from(sampleExamAnswer)
      .where(
        and(
          eq(sampleExamAnswer.examEventId, examEventId),
          eq(sampleExamAnswer.examName, examName),
        ),
      );

    const getExamId = db
      .select({ id: exams.id })
      .from(exams)
      .where(eq(exams.examName, examName));

    const getCodeGroupReguler = db
      .select({ id: examEvents.codeGroupRegulerId })
      .from(examEvents)
      .where(eq(examEvents.id, examEventId));

    const [examId, codeGroupReguler, sample] = await Promise.all([
      getExamId,
      getCodeGroupReguler,
      getSampleValue,
    ]);

    if (!examId[0]?.id) return { error: `Ujian ${examName} tidak ditemukan.` };
    if (!codeGroupReguler[0]?.id)
      return {
        error: `Tidak ditemukan bank soal untuk ujian dengan id ${examEventId}.`,
      };

    const correct = await db
      .selectDistinct({
        value: examName.includes("2 out of 5")
          ? codes.additionalValue
          : codes.value,
      })
      .from(codes)
      .where(
        and(
          eq(codes.codeGroupId, codeGroupReguler[0].id),
          eq(codes.examId, examId[0].id),
        ),
      );

    const correctArr = correct.map((data) => data.value);
    const sampleArr = sample.map((data) => data.value);

    return shuffle([...correctArr, ...sampleArr]);
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data." };
  }
}

export async function getExamInputFormBasedOnSelectedExamForm(
  examEventId: string,
) {
  try {
    const session = await validateSessionServer();
    const userId = session.user.id;

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
    const [[{ latestAttempt }], validExams] = await Promise.all([
      getLatestAttempt,
      getExamEventById(examEventId),
    ]);

    if ("error" in validExams) {
      return { error: validExams.error };
    }
    if (new Date() > new Date(validExams.examEnd)) {
      return { error: "Ujian ini telah berakhir." };
    }
    const currentAttempt = (latestAttempt ?? 0) + 1;
    if (currentAttempt > 4) {
      throw new Error("Kesempatan perbaikan ujian anda sudah habis.");
    }

    if (currentAttempt === 1) {
      // first exam
      const [{ selectedExamForFirstTimeExam }] = await db
        .select({
          selectedExamForFirstTimeExam: codeGroups.selectedExam,
        })
        .from(examEvents)
        .leftJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
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
      return { selectedExams: selectedExamForFirstTimeExam ?? "" };
    }
    // retake exam
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
    return { selectedExams: rows.map((data) => data.retakeExam).toString() };
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
    const getExamId = db
      .select({ id: exams.id })
      .from(exams)
      .where(eq(exams.examName, examName));

    const getCodeGroupReguler = db
      .select({ id: examEvents.codeGroupRegulerId })
      .from(examEvents)
      .where(eq(examEvents.id, examEventId));

    const [examId, codeGroupReguler] = await Promise.all([
      getExamId,
      getCodeGroupReguler,
    ]);

    if (!examId[0]?.id) return { error: `Ujian ${examName} tidak ditemukan.` };
    if (!codeGroupReguler[0]?.id)
      return {
        error: `Tidak ditemukan bank soal untuk ujian dengan id ${examEventId}.`,
      };

    const rows = await db
      .select({
        id: codes.id,
        value: codes.value,
        additionalValue: codes.additionalValue,
      })
      .from(codes)
      .where(
        and(
          eq(codes.codeGroupId, codeGroupReguler[0].id),
          eq(codes.examId, examId[0].id),
        ),
      );

    // show addValue if the exam is "2 out of 5", otherwise show value
    let values = rows.map((data) => ({
      id: data.id,
      value: examName.includes("2 out of 5")
        ? data.additionalValue || ""
        : data.value,
    }));
    values = [...new Map(values.map((item) => [item.value, item])).values()];
    return values.sort();
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
    const [row] = await db
      .selectDistinct({
        selectedExams: codeGroups.selectedExam,
      })
      .from(examEvents)
      .leftJoin(codeGroups, eq(examEvents.codeGroupRegulerId, codeGroups.id))
      .where(eq(examEvents.id, examEventId));

    const exams = [
      "2 out of 5 creamer",
      "2 out of 5 coklat",
      "2 out of 5 pure",
      "identifikasi",
    ];

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
  id: string,
  examEventId: string,
  sample: string,
  examName: string,
) {
  try {
    const [results] = await db
      .insert(sampleExamAnswer)
      .values({ id, value: sample, examEventId, examName });

    return { rowsAffected: results.affectedRows };
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
      .select({ id: sampleExamAnswer.id, value: sampleExamAnswer.value })
      .from(sampleExamAnswer)
      .where(
        and(
          eq(sampleExamAnswer.examEventId, examEventId),
          eq(sampleExamAnswer.examName, examName),
        ),
      );

    return rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data daftar ujian" };
  }
}

export async function deleteSampleExamAnswer(sampleId: string) {
  try {
    const [rows] = await db
      .delete(sampleExamAnswer)
      .where(eq(sampleExamAnswer.id, sampleId));

    return { rowsAffected: rows.affectedRows };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data daftar ujian" };
  }
}
