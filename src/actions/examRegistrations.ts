"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema/auth";
import { codeGroups } from "@/db/schema";
import { isValidRole } from "./validateSession";
import { examEvents, examRegistrations } from "@/db/schema/examEvents";

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

export async function assignCodeGroupExam({
  formData,
  selectedExam,
}: {
  formData: FormData;
  selectedExam: string;
}) {
  const codeGroupId = formData.get("code-group-exam") as string;

  if (!codeGroupId.trim()) {
    return { error: "Tidak ada id soal diberikan." };
  }

  try {
    const result = await db
      .update(examRegistrations)
      .set({ codeGroupId: Number(codeGroupId) })
      .where(eq(examRegistrations.selectedExam, selectedExam));

    if (result.rowsAffected === 0) {
      return { error: "Gagal mengupdate soal ujian" };
    }

    return result.rows;
  } catch (error) {
    console.error(error);
  }
}
