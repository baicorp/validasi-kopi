"use server";

import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { examRegistrations } from "@/db/schema/examEvents";
import { validateSessionServer } from "./validateSession";

export async function registerEvent(formData: FormData, examEventId: number) {
  const selectedExam = formData.getAll("selected-exam") as string[];
  if (selectedExam.length === 0) {
    return { error: "Setidaknya pilih salah satu ujian" };
  }

  try {
    // get user id;
    const session = await validateSessionServer();
    const userId = session.user.id;

    // check if user already registered
    const registeredResult = await db
      .select()
      .from(examRegistrations)
      .where(
        and(
          eq(examRegistrations.userId, userId),
          eq(examRegistrations.examEventId, examEventId),
        ),
      );
    if (registeredResult.length !== 0) {
      const selectedExam = registeredResult[0].selectedExam;
      return { error: `Anda sudah terdaftar dengan ujian ${selectedExam}.` };
    }

    // if user not registered then register the user
    const result = await db.insert(examRegistrations).values({
      userId,
      examEventId,
      selectedExam: selectedExam.toString(),
    });

    if (result.rowsAffected === 0) {
      return { error: "Gagal melakukan pendaftaran." };
    }

    return result.rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal melakukan pendaftaran. ID ujian tidak valid" };
  }
}
