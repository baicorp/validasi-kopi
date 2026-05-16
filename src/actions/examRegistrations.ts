"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { departments, user } from "@/db/schema/auth";
import { Participants } from "@/lib/types";
import { getExamEventById } from "./examEvents";
import { isValidRole } from "./validateSession";
import { examRegistrations } from "@/db/schema/examEvents";

export async function getAllRegisteredUser(examEventId: string) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const rows = await db
      .select({
        id: user.id,
        username: user.username,
        name: user.name,
        department: departments.departmentName,
      })
      .from(examRegistrations)
      .innerJoin(user, eq(examRegistrations.userId, user.id))
      .innerJoin(departments, eq(user.departmentId, departments.id))
      .where(eq(examRegistrations.examEventId, examEventId));

    return rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan daftar peserta ujian." };
  }
}

export async function assignUser(
  listParticipant: Participants[],
  eventId: string,
) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    if (!listParticipant || listParticipant.length === 0) {
      return { error: "Tidak ada peserta yang dipilih." };
    }

    const examEvent = await getExamEventById(eventId);
    if ("error" in examEvent) {
      return { error: "Gagal mendapatkan detail ujian." };
    }

    if (listParticipant.length > examEvent.totalParticipants) {
      return {
        error: `Maksimal peserta yang dapat didaftarkan adalah ${examEvent.totalParticipants} orang`,
      };
    }

    const transationResult = await db.transaction(async (tx) => {
      // 1. delete all registered user
      await tx
        .delete(examRegistrations)
        .where(eq(examRegistrations.examEventId, eventId));

      // 2. register new selected user
      const values = listParticipant.map((participant) => ({
        examEventId: eventId,
        userId: participant.id,
      }));
      const result = await tx.insert(examRegistrations).values(values);

      if (result.rowsAffected === 0) {
        throw Error("Gagal menambahkan peserta");
      }

      return result.rows;
    });

    return transationResult;
  } catch (error) {
    console.error("assignUser error:", error);
    return { error: "Gagal menambahkan peserta ujian." };
  }
}
