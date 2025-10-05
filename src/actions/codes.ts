"use server";

import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { InsertCodesType } from "@/lib/types";
import { codes, codeGroups, examCategories, exams } from "@/db/schema";

export async function addGeneratedCodes(
  codeGroupsName: string,
  examsLabel: string,
  totalParticipants: number,
  listCode: InsertCodesType[],
) {
  if (listCode.length === 0) {
    return { error: "Daftar soal kosong." };
  }

  try {
    await db.transaction(async (tx) => {
      const rows = await tx
        .insert(codeGroups)
        .values({
          groupName: codeGroupsName,
          examsLabel,
          totalParticipants,
        })
        .returning();

      if (rows.length === 0) {
        return { error: "Gagal menyimpan soal. Database bermasalah." };
      }

      const codeGroupId = rows[0].id;
      const codesToInsert = listCode.map((code) => ({ ...code, codeGroupId }));

      await tx.insert(codes).values(codesToInsert);
    });
    revalidatePath("/dashboard/list-soal");
  } catch (error) {
    console.error(error);
    return { error: "Gagal menyimpan soal. Database bermasalah." };
  }
}

export async function deleteGeneratedCode(codeGroupsId: string) {
  const id = parseInt(codeGroupsId.trim());
  try {
    await db.delete(codeGroups).where(eq(codeGroups.id, id));
    revalidatePath("/dashboard/list-soal");
  } catch (error) {
    console.error(error);
    return { error: "Gagal menghapus soal. Database bermasalah." };
  }
}

export async function getTableData(codeGroupId: string) {
  const groupId = parseInt(codeGroupId.trim());

  try {
    return await db
      .select({
        id: codes.id,
        groupName: codeGroups.groupName,
        examsLabel: codeGroups.examsLabel,
        totalParticipants: codeGroups.totalParticipants,
        code: codes.code,
        value: codes.value,
        examName: exams.examName,
        examCategoryName: examCategories.categoryName,
      })
      .from(codes)
      .innerJoin(codeGroups, eq(codes.codeGroupId, codeGroups.id))
      .innerJoin(exams, eq(exams.id, codes.examId))
      .innerJoin(examCategories, eq(exams.examCategoryId, examCategories.id))
      .where(eq(codeGroups.id, groupId));
  } catch (error) {
    console.error(error);
    return {
      error: `Gagal mendapat soal dengan id ${codeGroupId}. Database bermasalah.`,
    };
  }
}

export async function getListSoal() {
  try {
    return await db
      .select()
      .from(codeGroups)
      .orderBy(desc(codeGroups.createdAt));
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapat list soal. Database bermasalah." };
  }
}
