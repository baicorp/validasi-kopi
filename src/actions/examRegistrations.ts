"use server";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { codeGroups } from "@/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { isValidRole, validateSessionServer } from "./validateSession";
import { examEvents, examRegistrations } from "@/db/schema/examEvents";

export async function registerEvent(formData: FormData, examEventId: number) {
  let selectedExam = formData.getAll("selected-exam") as string[];
  if (selectedExam.length === 0) {
    return { error: "Setidaknya pilih salah satu ujian" };
  }

  // sort selectedExam. IMPORTANT for grouping query
  selectedExam = selectedExam.sort();

  try {
    // get user id;
    const session = await validateSessionServer();
    const userId = session.user.id;

    // check if current time is within registration period
    const currentDateTime = new Date().toISOString();
    const event = await db
      .select()
      .from(examEvents)
      .where(
        and(
          eq(examEvents.id, examEventId),
          lte(examEvents.registrationStart, currentDateTime),
          gte(examEvents.registrationEnd, currentDateTime),
        ),
      );
    if (event.length === 0) {
      return {
        error: "Waktu saat ini berada di luar periode pendaftaran ujian.",
      };
    }

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

export async function getUserRegisteredExamEvents(examEventId: number) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const rows = await db
      .select({
        username: user.username,
        name: user.name,
        position: user.position,
        codeGroupId: codeGroups.id,
        selectedExam: examRegistrations.selectedExam,
      })
      .from(examRegistrations)
      .innerJoin(examEvents, eq(examRegistrations.examEventId, examEvents.id))
      .innerJoin(user, eq(examRegistrations.userId, user.id))
      .leftJoin(codeGroups, eq(examRegistrations.codeGroupId, codeGroups.id))
      .where(eq(examEvents.id, examEventId));

    const groupBySelectedExam = Object.groupBy(
      rows,
      ({ selectedExam }) => selectedExam,
    );
    return Object.keys(groupBySelectedExam).map((key) => ({
      examGroup: key,
      codeGroupId: groupBySelectedExam[key]![0].codeGroupId,
      data: groupBySelectedExam[key]!,
    }));
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan daftar peserta ujian." };
  }
}
