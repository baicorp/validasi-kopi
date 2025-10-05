"use server";

import { db } from "@/db";
import { productCategories } from "@/db/schema";

export async function getAllProductCategories() {
  try {
    return await db.select().from(productCategories);
  } catch (error) {
    console.error(error);
    return {
      error: "Gagal mendapat data kategori produk. Database bermasalah.",
    };
  }
}
