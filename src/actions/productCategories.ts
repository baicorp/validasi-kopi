"use server";

import { db } from "@/db";
import { productCategories } from "@/db/schema";
import { isValidRole } from "./validateSession";

export async function getAllProductCategories() {
  try {
    const isValid = await isValidRole("admin");

    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }
    return await db.select().from(productCategories);
  } catch (error) {
    console.error(error);
    return {
      error: "Gagal mendapat data kategori produk. Database bermasalah.",
    };
  }
}
