"use server";

import { db } from "@/db";
import { kategoriProduk } from "@/db/schema";

export async function getAllCategory() {
  try {
    const result = await db.select().from(kategoriProduk);
    return result;
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error("Gagal membaca semua kategori ");
  }
}
