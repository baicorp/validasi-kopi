"use server";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { codeGroups } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { and, desc, eq, gte, like, lte, sql } from "drizzle-orm";
import { examEvents, examRegistrations } from "@/db/schema/examEvents";
import { isValidRole, validateSessionServer } from "./validateSession";

export async function addExamEvent(formData: FormData) {
  const eventName = formData.get("registration-name") as string;
  const registrationStartDate = formData.get(
    "registration-start-date",
  ) as string;
  const registrationStartTime = formData.get(
    "registration-start-time",
  ) as string;
  const registrationEndDate = formData.get("registration-end-date") as string;
  const registrationEndTime = formData.get("registration-end-time") as string;
  const eventStartDate = formData.get("event-start-date") as string;
  const eventStartTime = formData.get("event-start-time") as string;
  const eventEndDate = formData.get("event-end-date") as string;
  const eventEndTime = formData.get("event-end-time") as string;

  if (
    !eventName.trim() ||
    !registrationStartDate ||
    !registrationStartTime ||
    !registrationEndDate ||
    !registrationEndTime ||
    !eventStartDate ||
    !eventStartTime ||
    !eventEndDate ||
    !eventEndTime
  ) {
    return { error: "Lengkapi semua data pendaftaran ujian." };
  }

  // combine date and time into Date objects (ISO format)
  const registrationStart = new Date(
    `${registrationStartDate} ${registrationStartTime}`,
  ).toISOString();
  const registrationEnd = new Date(
    `${registrationEndDate} ${registrationEndTime}`,
  ).toISOString();
  const examStart = new Date(
    `${eventStartDate} ${eventStartTime}`,
  ).toISOString();
  const examEnd = new Date(`${eventEndDate} ${eventEndTime}`).toISOString();

  // registration end must be after registration start
  if (registrationEnd <= registrationStart) {
    return {
      error:
        "Tanggal/waktu pendaftaran selesai harus setelah pendaftaran dimulai.",
    };
  }

  // exam start must be after registration end
  if (examStart <= registrationEnd) {
    return {
      error: "Tanggal/waktu ujian harus setelah pendaftaran selesai.",
    };
  }

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
      registrationStart,
      registrationEnd,
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
  const eventName = formData.get("registration-name") as string;
  const registrationStartDate = formData.get(
    "registration-start-date",
  ) as string;
  const registrationStartTime = formData.get(
    "registration-start-time",
  ) as string;
  const registrationEndDate = formData.get("registration-end-date") as string;
  const registrationEndTime = formData.get("registration-end-time") as string;
  const eventStartDate = formData.get("event-start-date") as string;
  const eventStartTime = formData.get("event-start-time") as string;
  const eventEndDate = formData.get("event-end-date") as string;
  const eventEndTime = formData.get("event-end-time") as string;

  if (
    !eventName.trim() ||
    !registrationStartDate ||
    !registrationStartTime ||
    !registrationEndDate ||
    !registrationEndTime ||
    !eventStartDate ||
    !eventStartTime ||
    !eventEndDate ||
    !eventEndTime
  ) {
    return { error: "Lengkapi semua data pendaftaran ujian." };
  }

  // combine date and time into Date objects (ISO format)
  const registrationStart = new Date(
    `${registrationStartDate} ${registrationStartTime}`,
  ).toISOString();
  const registrationEnd = new Date(
    `${registrationEndDate} ${registrationEndTime}`,
  ).toISOString();
  const examStart = new Date(
    `${eventStartDate} ${eventStartTime}`,
  ).toISOString();
  const examEnd = new Date(`${eventEndDate} ${eventEndTime}`).toISOString();

  // registration end must be after registration start
  if (registrationEnd <= registrationStart) {
    return {
      error:
        "Tanggal/waktu pendaftaran selesai harus setelah pendaftaran dimulai.",
    };
  }

  // exam start must be after registration end
  if (examStart <= registrationEnd) {
    return {
      error: "Tanggal/waktu ujian harus setelah pendaftaran selesai.",
    };
  }

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
        registrationStart,
        registrationEnd,
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
        selectedExam: examRegistrations.selectedExam,
        codeGroupId: codeGroups.id,
      })
      .from(examRegistrations)
      .innerJoin(examEvents, eq(examRegistrations.examEventId, examEvents.id))
      .leftJoin(codeGroups, eq(examRegistrations.codeGroupId, codeGroups.id))
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

export async function getActiveRegistrationExamEvent() {
  try {
    const currentDateTime = new Date().toISOString();

    // get current user username (nik)
    const session = await validateSessionServer();
    const username = session.user.username;

    const rows = await db
      .select({
        examEventId: examEvents.id,
        examEventName: examEvents.examEventName,
        registrationStart: examEvents.registrationStart,
        registrationEnd: examEvents.registrationEnd,
        examStart: examEvents.examStart,
        examEnd: examEvents.examEnd,
        selectedExam: examRegistrations.selectedExam,
        isRegistered: sql<boolean>`CASE WHEN ${examRegistrations.id} IS NOT NULL THEN 1 ELSE 0 END`,
      })
      .from(user)
      .innerJoin(
        examEvents,
        and(
          lte(examEvents.registrationStart, currentDateTime),
          gte(examEvents.registrationEnd, currentDateTime),
        ),
      )
      .leftJoin(
        examRegistrations,
        and(
          eq(examRegistrations.examEventId, examEvents.id),
          eq(examRegistrations.userId, user.id),
        ),
      )
      .where(eq(user.username, username));

    return rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data pendaftaran ujian aktif." };
  }
}

export async function getAllExamEvents(
  page: number = 1,
  search: string | undefined,
) {
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
      .where(conditions.length ? and(...conditions) : undefined);

    const data = await db
      .select()
      .from(examEvents)
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
