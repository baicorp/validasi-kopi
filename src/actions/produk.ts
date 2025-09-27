"use server";

import { db } from "@/db";
import { desc, eq, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { kategoriProduk, produk } from "@/db/schema";

// CREATE
export async function addProduct(e: FormData) {
  const namaProduk = e.get("nama-produk") as string;
  const kategoriId = e.get("kategori-produk") as string;

  try {
    if (!namaProduk?.trim() || !kategoriId?.trim())
      throw new Error("Nama produk dan kategori produk harus di isi");

    await db.insert(produk).values({
      namaProduk: namaProduk.trim(),
      kategoriId: Number(kategoriId.trim()),
    });

    revalidatePath("/dashboard/produk");
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error(
      "Gagal menambahkan produk. Pastikan produk belum belum pernah ditambahkan.",
    );
  }
}

// READ (semua produk)
export async function getAllProduct() {
  try {
    const result = await db
      .select({
        id: produk.id,
        namaProduk: produk.namaProduk,
        namaKategori: kategoriProduk.kategori,
        idKategori: kategoriProduk.id,
      })
      .from(produk)
      .leftJoin(kategoriProduk, eq(produk.kategoriId, kategoriProduk.id))
      .orderBy(desc(produk.createdAt)); // urutkan dari terbaru ke lama

    return result;
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error("Gagal mengambil produk dengan kategori");
  }
}

// READ (produk by kategori)
export async function getProductByCategory(categoryId: number) {
  try {
    const result = await db
      .select()
      .from(produk)
      .where(eq(produk.kategoriId, categoryId));
    return result;
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error("Gagal mengambil produk berdasarkan kategori");
  }
}

// READ (produk by name, pakai LIKE / includes)
export async function getProdukByName(name: string) {
  try {
    const result = await db
      .select()
      .from(produk)
      .where(like(produk.namaProduk, `%${name}%`));
    return result;
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error("Gagal mengambil produk berdasarkan nama");
  }
}

// UPDATE
export async function updateProduk(id: number, formData: FormData) {
  try {
    const namaProduk = (formData.get("nama-produk") as string).trim();
    const kategoriId = Number(
      (formData.get("kategori-produk") as string).trim(),
    );

    await db
      .update(produk)
      .set({
        namaProduk: namaProduk,
        kategoriId: kategoriId,
      })
      .where(eq(produk.id, id));

    revalidatePath("/dashboard/produk");
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error("Gagal mengupdate produk");
  }
}

// DELETE
export async function deleteProduk(id: string) {
  const intId = Number(id);
  try {
    await db.delete(produk).where(eq(produk.id, intId)).returning();
    revalidatePath("/dashboard/produk");
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error("Gagal menghapus produk");
  }
}
