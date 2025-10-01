"use server";

import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { rasaTresholdMix } from "@/db/schema";

export async function addRasaMix(formData: FormData) {
  const rasaSatu = formData.get("rasa-satu") as string;
  const rasaDua = formData.get("rasa-dua") as string;

  try {
    if (!rasaSatu?.trim() || !rasaDua?.trim()) {
      throw new Error("Rasa 1 dan Rasa 2 harus di isi.");
    }

    await db.insert(rasaTresholdMix).values({
      rasaMix: `${rasaSatu.trim()} + ${rasaDua.trim()}`,
    });

    revalidatePath("/dashboard/rasa-mix");
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error(
      "Gagal menambahkan rasa. Pastikan kombinasi rasa belum ada.",
    );
  }
}

export async function getAllRasaMix() {
  try {
    const result = await db
      .select({
        id: rasaTresholdMix.id,
        rasaMix: rasaTresholdMix.rasaMix,
      })
      .from(rasaTresholdMix)
      .orderBy(desc(rasaTresholdMix.createdAt)); // urutkan dari terbaru ke lama

    return result;
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error("Gagal memperoleh data rasa mix.");
  }
}

export async function updateRasaMix(id: number, formData: FormData) {
  try {
    const rasaSatu = formData.get("rasa-satu") as string;
    const rasaDua = formData.get("rasa-dua") as string;

    if (!rasaSatu?.trim() || !rasaDua?.trim()) {
      throw new Error("Rasa 1 dan Rasa 2 harus di isi.");
    }

    await db
      .update(rasaTresholdMix)
      .set({
        rasaMix: `${rasaSatu.trim()} + ${rasaDua.trim()}`,
      })
      .where(eq(rasaTresholdMix.id, id));

    revalidatePath("/dashboard/rasa-mix");
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error("Gagal mengupdate rasa mix.");
  }
}

export async function deleteRasaMix(id: string) {
  const intId = Number(id);
  try {
    await db
      .delete(rasaTresholdMix)
      .where(eq(rasaTresholdMix.id, intId))
      .returning();
    revalidatePath("/dashboard/rasa-mix");
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error("Gagal menghapus rasa mix");
  }
}
