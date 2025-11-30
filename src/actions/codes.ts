"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { validateSessionServer } from "./validateSession";
import { InsertCodes, ExamDataDetails } from "@/lib/types";
import { formatRawExamsData, getExamsId } from "@/lib/utils";
import { codes, codeGroups, examCategories, exams } from "@/db/schema";

export async function addGeneratedCodes(data: ExamDataDetails) {
  if (data.rowExamsData.length === 0) {
    return { error: "Daftar soal kosong." };
  }

  let codeGroupId: string;

  try {
    const isValid = await validateSessionServer();
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const result = await db.transaction(async (tx) => {
      const rowCodeGroups = await tx
        .insert(codeGroups)
        .values({
          groupName: data.groupName,
          selectedExam: data.selectedExam,
          totalParticipants: data.totalParticipants,
        })
        .returning();

      // get id and examName from exams table (use for getting exam id based on examName)
      const rowExams = await tx
        .select({ id: exams.id, examName: exams.examName })
        .from(exams);

      if (rowExams.length === 0 || rowCodeGroups.length === 0) {
        return { error: "Gagal menyimpan soal." };
      }

      // data to insert in codes table
      codeGroupId = rowCodeGroups[0].id;
      const codesToInsert: InsertCodes[] = data.rowExamsData.map((row) => {
        const examId = getExamsId(row.examName, rowExams);
        if (!examId) {
          throw Error("ID ujian tidak ditemukan.");
        }
        return {
          code: row.code,
          value: row.value,
          additionalValue: row.additionalValue,
          examId,
          codeGroupId,
        };
      });

      const row = await tx.insert(codes).values(codesToInsert);
      if (row.rowsAffected === 0) {
        return { error: "Gagal menyimpan daftar kode." };
      }

      return rowCodeGroups[0];
    });

    revalidatePath("/dashboard/list-soal");
    return result;
  } catch (error) {
    console.error(error);
    return { error: "Gagal menyimpan soal." };
  }
}

export async function deleteGeneratedCode(codeGroupId: string) {
  try {
    const isValid = await validateSessionServer();
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    await db.delete(codeGroups).where(eq(codeGroups.id, codeGroupId));

    revalidatePath("/dashboard/list-soal");
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
      return { error: "Gagal menghapus soal. Soal mungkin digunakan." };
    }
    return { error: "Gagal menghapus soal. Database bermasalah." };
  }
}

export async function getTableData(
  codeGroupId: string,
): Promise<ExamDataDetails | { error: string }> {
  try {
    const isValid = await validateSessionServer();
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const rows = await db
      .select({
        id: codes.id,
        groupName: codeGroups.groupName,
        selectedExam: codeGroups.selectedExam,
        totalParticipants: codeGroups.totalParticipants,
        code: codes.code,
        value: codes.value,
        additionalValue: codes.additionalValue,
        examName: exams.examName,
        examCategoryName: examCategories.categoryName,
      })
      .from(codes)
      .innerJoin(codeGroups, eq(codes.codeGroupId, codeGroups.id))
      .innerJoin(exams, eq(exams.id, codes.examId))
      .innerJoin(examCategories, eq(exams.examCategoryId, examCategories.id))
      .where(eq(codeGroups.id, codeGroupId));

    return {
      groupName: rows[0].groupName,
      selectedExam: rows[0].selectedExam,
      totalParticipants: rows[0].totalParticipants,
      rowExamsData: rows,
      formatedExamsData: formatRawExamsData(rows),
    };
  } catch (error) {
    console.error(error);
    return {
      error: `Gagal mendapat soal dengan id ${codeGroupId}. Database bermasalah.`,
    };
  }
}
