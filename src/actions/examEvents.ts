"use server";

import { db } from "@/db";
import {
  examEvents,
  examRegistrations,
  submissionAttemps,
} from "@/db/schema/examEvents";
import { codeGroups } from "@/db/schema";
import { revalidatePath } from "next/cache";
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

  // combine date and time into Date objects (ISO format)
  const examStart = new Date(
    `${eventStartDate} ${eventStartTime}`,
  ).toISOString();
  const examEnd = new Date(`${eventEndDate} ${eventEndTime}`).toISOString();

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
      codeGroupRegulerId: Number(codeGroupExam[0]),
      codeGroupRetakeId: Number(codeGroupExam[1]),
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

export async function updateExamEvent(formData: FormData, examEventId: number) {
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

  // combine date and time into Date objects (ISO format)
  const examStart = new Date(
    `${eventStartDate} ${eventStartTime}`,
  ).toISOString();
  const examEnd = new Date(`${eventEndDate} ${eventEndTime}`).toISOString();

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

export async function getActiveExamEvent() {
  try {
    const currentDateTime = new Date().toISOString();

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

    // 3. find latest attempt of each founded exam
    const listExamEventId = rows.map((row) => row.examEventId);
    const latestAttempts = db
      .select({
        examEventId: submissionAttemps.examEventId,
        maxAttempt: sql<number>`max(${submissionAttemps.numberAttemp})`.as(
          "maxAttempt",
        ),
      })
      .from(submissionAttemps)
      .where(eq(submissionAttemps.userId, userId))
      .groupBy(submissionAttemps.examEventId)
      .as("latestAttempts");

    const latestAttemptRows = await db
      .select({
        examEventId: submissionAttemps.examEventId,
        numberAttempt: submissionAttemps.numberAttemp,
        retakeExam: submissionAttemps.retakeExam,
      })
      .from(submissionAttemps)
      .innerJoin(
        latestAttempts,
        and(
          eq(submissionAttemps.examEventId, latestAttempts.examEventId),
          eq(submissionAttemps.numberAttemp, latestAttempts.maxAttempt),
        ),
      )
      .where(
        and(
          inArray(submissionAttemps.examEventId, listExamEventId),
          eq(submissionAttemps.userId, userId),
        ),
      );

    // 4. add numberAttempt and retakeExam filed to the active exam event data
    const completeData = rows.map((row) => {
      const foundAttempt = latestAttemptRows.find(
        (attempt) => attempt.examEventId === row.examEventId,
      );
      return {
        ...row,
        numberAttempt: foundAttempt ? foundAttempt.numberAttempt : 0,
        retakeExam: latestAttemptRows
          .filter(
            (data) => row.examEventId === data.examEventId && data.retakeExam,
          )
          .map((data) => data.retakeExam)
          .toString(),
      };
    });

    return completeData;
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data ujian aktif." };
  }
}

export async function getExamEventById(examEventId: number) {
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
