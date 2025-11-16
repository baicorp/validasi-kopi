"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema/auth";
import { isValidRole } from "./validateSession";
import { examRegistrations } from "@/db/schema/examEvents";
import { Participants } from "@/lib/types";

export async function getAllRegisteredUser(examEventId: number) {
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
      })
      .from(examRegistrations)
      .innerJoin(user, eq(examRegistrations.userId, user.id))
      .where(eq(examRegistrations.examEventId, examEventId));

    return rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan daftar peserta ujian." };
  }
}

export async function assignUser(
  listParticipant: Participants[],
  eventId: number,
) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    if (!listParticipant || listParticipant.length === 0) {
      return { error: "Tidak ada peserta yang dipilih." };
    }

    await db
      .delete(examRegistrations)
      .where(eq(examRegistrations.examEventId, eventId));

    const values = listParticipant.map((participant) => ({
      examEventId: eventId,
      userId: participant.id,
    }));

    const result = await db.insert(examRegistrations).values(values);

    if (result.rowsAffected === 0) {
      return { error: "Gagal menambahkan peserta" };
    }

    return result.rows;
  } catch (error) {
    console.error("assignUser error:", error);
    return { error: "Gagal menambahkan peserta ujian." };
  }
}
