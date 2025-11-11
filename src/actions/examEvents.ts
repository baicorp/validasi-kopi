"use server";

import { db } from "@/db";
import { codeGroups } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { and, desc, eq, gte, like, lte, sql } from "drizzle-orm";
import { examEvents, examRegistrations } from "@/db/schema/examEvents";
import { isValidRole, validateSessionServer } from "./validateSession";

export async function addExamEvent(formData: FormData) {
  const eventName = (formData.get("event-name") as string).trim();
  const codeGroupId = (formData.get("code-group-exam") as string).trim();
  const eventStartDate = formData.get("event-start-date") as string;
  const eventStartTime = formData.get("event-start-time") as string;
  const eventEndDate = formData.get("event-end-date") as string;
  const eventEndTime = formData.get("event-end-time") as string;

  if (
    !eventName ||
    !codeGroupId ||
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
      codeGroupId: Number(codeGroupId),
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

    // get current user username (nik)
    const session = await validateSessionServer();
    const userId = session.user.id;

    const rows = await db
      .select({
        examEventId: examEvents.id,
        examEventName: examEvents.examEventName,
        examStart: examEvents.examStart,
        examEnd: examEvents.examEnd,
        selectedExam: codeGroups.examsLabel,
        codeGroupId: codeGroups.id,
      })
      .from(examRegistrations)
      .innerJoin(examEvents, eq(examRegistrations.examEventId, examEvents.id))
      .innerJoin(codeGroups, eq(examEvents.codeGroupId, codeGroups.id))
      .where(
        and(
          eq(examRegistrations.userId, userId),
          lte(examEvents.examStart, currentDateTime),
          gte(examEvents.examEnd, currentDateTime),
        ),
      );

    return rows;
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
        codeGroupId: examEvents.codeGroupId,
        createdAt: examEvents.createdAt,
        updatedAt: examEvents.updatedAt,
        selectedExams: codeGroups.examsLabel,
        totalParticipants: codeGroups.totalParticipants,
      })
      .from(examEvents)
      .innerJoin(codeGroups, eq(examEvents.codeGroupId, codeGroups.id))
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
      .innerJoin(codeGroups, eq(examEvents.codeGroupId, codeGroups.id))
      .where(conditions.length ? and(...conditions) : undefined);

    const data = await db
      .select({
        id: examEvents.id,
        examEventName: examEvents.examEventName,
        examStart: examEvents.examStart,
        examEnd: examEvents.examEnd,
        codeGroupId: examEvents.codeGroupId,
        createdAt: examEvents.createdAt,
        updatedAt: examEvents.updatedAt,
        selectedExams: codeGroups.examsLabel,
        totalParticipants: codeGroups.totalParticipants,
      })
      .from(examEvents)
      .innerJoin(codeGroups, eq(examEvents.codeGroupId, codeGroups.id))
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
