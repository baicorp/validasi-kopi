"use server";

import { db } from "@/db";
import { ExamName } from "@/lib/types";
import { codeGroups } from "@/db/schema";
import { isValidRole } from "./validateSession";
import { examEvents } from "@/db/schema/examEvents";
import { desc, eq, isNull, like, or, sql } from "drizzle-orm";

export async function getAllCodeGroups(page: number = 1, search?: string) {
  const limit = 12;
  const offset = (page - 1) * limit;
  const conditions = [];
  if (search) {
    conditions.push(
      like(codeGroups.groupName, `%${search}%`),
      like(codeGroups.selectedExam, `%${search}%`),
    );
  }

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const getTotal = db
      .select({ count: sql<number>`count(*)` })
      .from(codeGroups)
      .where(conditions.length ? or(...conditions) : undefined);

    const getAllCodeGroup = db
      .select()
      .from(codeGroups)
      .where(conditions.length ? or(...conditions) : undefined)
      .orderBy(desc(codeGroups.createdAt))
      .limit(limit)
      .offset(offset);

    const [[{ count }], data] = await Promise.all([getTotal, getAllCodeGroup]);

    return {
      data: data.map((data) => ({
        ...data,
        selectedExam: data.selectedExam.split(",") as ExamName[],
      })),
      page,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapat list soal. Database bermasalah." };
  }
}

export async function getCodeGroupsForExam() {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const rows = await db
      .select({
        id: codeGroups.id,
        groupName: codeGroups.groupName,
        selectedExam: codeGroups.selectedExam,
        totalParticipants: codeGroups.totalParticipants,
        createdAt: codeGroups.createdAt,
        updatedAt: codeGroups.updatedAt,
      })
      .from(codeGroups)
      .leftJoin(
        examEvents,
        or(
          eq(examEvents.codeGroupRegulerId, codeGroups.id),
          eq(examEvents.codeGroupRetakeId, codeGroups.id),
        ),
      )
      .where(isNull(examEvents.id))
      .orderBy(desc(codeGroups.createdAt));

    return rows.map((row) => ({
      ...row,
      selectedExam: row.selectedExam.split(",") as ExamName[],
    }));
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapat list soal. Database bermasalah." };
  }
}

export async function getCodeGroupById(codeGroupId: string) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const rows = await db
      .select()
      .from(codeGroups)
      .where(eq(codeGroups.id, codeGroupId))
      .orderBy(desc(codeGroups.createdAt));

    if (rows.length === 0) {
      return { error: "Soal tidak ditemukan." };
    }

    return {
      ...rows[0],
      selectedExam: rows[0].selectedExam.split(",") as ExamName[],
    };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapat list soal. Database bermasalah." };
  }
}
