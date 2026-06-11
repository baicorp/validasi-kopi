"use server";

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isValidRole } from "./validateSession";
import { formatRawExamsData, getExamsId } from "@/lib/utils";
import { InsertCodes, ExamDataDetails, ExamName } from "@/lib/types";
import { codes, codeGroups, examCategories, exams } from "@/db/schema";

export async function addGeneratedCodes(data: ExamDataDetails) {
  if (data.rowExamsData.length === 0) {
    return { error: "Daftar soal kosong." };
  }

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const result = await db.transaction(async (tx) => {
      // 1. insert intod codeGroups
      const codeGroupId = crypto.randomUUID();
      const insertRowCodeGroups = tx.insert(codeGroups).values({
        id: codeGroupId,
        groupName: data.groupName,
        selectedExam: data.selectedExam,
        totalParticipants: data.totalParticipants,
      });

      // 2. Fetch exams to map names to IDs
      const getRowExams = await tx
        .select({ id: exams.id, examName: exams.examName })
        .from(exams);

      const [rowCodeGroups, rowExams] = await Promise.all([
        insertRowCodeGroups,
        getRowExams,
      ]);

      if (rowExams.length === 0 || rowCodeGroups[0].affectedRows === 0) {
        return { error: "Gagal menyimpan soal." };
      }

      // 3. Prepare data for codes table
      const codesToInsert: InsertCodes[] = data.rowExamsData.map((row) => {
        const examId = getExamsId(row.examName, rowExams);
        if (!examId) {
          throw new Error("ID ujian tidak ditemukan.");
        }
        return {
          code: row.code,
          value: row.value,
          additionalValue: row.additionalValue,
          examId,
          codeGroupId,
        };
      });

      // 4. Batch insert into codes
      const [codesResult] = await tx.insert(codes).values(codesToInsert);

      if (codesResult.affectedRows === 0) {
        return { error: "Gagal menyimpan daftar kode." };
      }

      return {
        id: codeGroupId,
        groupName: data.groupName,
        selectedExam: data.selectedExam,
        totalParticipants: data.totalParticipants,
      };
    });

    revalidatePath("/dashboard/daftar-soal");
    return result;
  } catch (error) {
    console.error("Database Error:", error);
    return { error: "Gagal menyimpan soal." };
  }
}

export async function deleteGeneratedCode(codeGroupId: string) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    await db.delete(codeGroups).where(eq(codeGroups.id, codeGroupId));

    revalidatePath("/dashboard/daftar-soal");
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
    const isValid = await isValidRole("admin");
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
      rowExamsData: rows.map((row) => ({
        ...row,
        selectedExam: row.selectedExam.split(",") as ExamName[],
      })),
      formatedExamsData: formatRawExamsData(
        rows.map((row) => ({
          ...row,
          selectedExam: row.selectedExam.split(",") as ExamName[],
        })),
      ),
    };
  } catch (error) {
    console.error(error);
    return {
      error: `Gagal mendapat soal dengan id ${codeGroupId}. Database bermasalah.`,
    };
  }
}
