"use server";

import { db } from "@/db";
import { exams } from "@/db/schema";

export async function getAllExams() {
  try {
    return await db
      .select({ id: exams.id, examName: exams.examName })
      .from(exams);
  } catch (error) {
    console.error(error);
  }
}
