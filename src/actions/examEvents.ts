"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";
import { isValidRole } from "./validateSession";
import { examEvents } from "@/db/schema/examEvents";
import { and, desc, like, sql } from "drizzle-orm";

export async function addExamEvent(formData: FormData) {
  const registrationName = formData.get("registration-name") as string;
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
    !registrationName.trim() ||
    !registrationStartDate.trim() ||
    !registrationStartTime.trim() ||
    !registrationEndDate.trim() ||
    !registrationEndTime.trim() ||
    !eventStartDate.trim() ||
    !eventStartTime.trim() ||
    !eventEndDate.trim() ||
    !eventEndTime.trim()
  ) {
    return { error: "Lengkapi semua data pendaftaran ujian." };
  }

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const newEvent = await db.insert(examEvents).values({
      examEventName: registrationName,
      registrationStart: `${registrationStartDate} ${registrationStartTime}`,
      registrationEnd: `${registrationEndDate} ${registrationEndTime}`,
      examStart: `${eventStartDate} ${eventStartTime}`,
      examEnd: `${eventEndDate} ${eventEndTime}`,
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
