"use server";

import { db } from "@/db";
import { codeGroups } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { isValidRole } from "./validateSession";

export async function getCodeGroupsForExam(
  selectedExam: string,
  totalParticipants: number,
) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const rows = await db
      .select()
      .from(codeGroups)
      .where(
        and(
          eq(codeGroups.examsLabel, selectedExam),
          eq(codeGroups.totalParticipants, totalParticipants),
        ),
      )
      .orderBy(desc(codeGroups.createdAt));

    return rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapat list soal. Database bermasalah." };
  }
}
