"use server";

import { db } from "@/db";
import { toTitleCase } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { and, desc, eq, sql } from "drizzle-orm";
import { productCategories, products } from "@/db/schema";

export async function addProduct(formData: FormData) {
  const productName = (formData.get("nama-produk") as string).trim();
  const productCategoryId = (formData.get("kategori-produk") as string).trim();

  if (!productName || !productCategoryId) {
    return { error: "Nama dan kategori produk harus di isi" };
  }

  try {
    db.transaction(async (tx) => {
      const rows = await tx
        .select()
        .from(products)
        .where(
          and(
            eq(sql`lower(${products.productName})`, productName.toLowerCase()),
            eq(products.productCategoryId, parseInt(productCategoryId)),
          ),
        );

      if (rows.length !== 0) {
        return {
          error: `Gagal menambahkan produk. Produk ${toTitleCase(productName)} sudah ada.`,
        };
      }

      await tx.insert(products).values({
        productName: productName,
        productCategoryId: Number(productCategoryId),
      });
    });

    revalidatePath("/dashboard/produk");
  } catch (error) {
    console.error(error);
    return { error: "Gagal menambahkan produk. Database bermasalah." };
  }
}

export async function getAllProduct() {
  try {
    return await db
      .select({
        id: products.id,
        namaProduk: products.productName,
        namaKategori: productCategories.categoryName,
        idKategori: productCategories.id,
      })
      .from(products)
      .leftJoin(
        productCategories,
        eq(products.productCategoryId, productCategories.id),
      )
      .orderBy(desc(products.createdAt));
  } catch (error) {
    console.error(error);
    return { error: "Gagal mengambil data produk, Database bermasalah." };
  }
}

export async function getProductsByCategory(productId: string) {
  const id = parseInt(productId.trim());

  try {
    return await db.select().from(products).where(eq(products.id, id));
  } catch (error) {
    console.error(error);
    return {
      error: `Gagal mengambil data produk dengan id kategori ${id}, Database bermasalah.`,
    };
  }
}

export async function updateProduct(productId: number, formData: FormData) {
  const productName = (formData.get("nama-produk") as string).trim();
  const productCategoryId = (formData.get("kategori-produk") as string).trim();

  if (!productName || !productCategoryId) {
    return { error: "Nama dan id kategori produk harus di isi." };
  }

  try {
    await db
      .update(products)
      .set({
        productName: productName,
        productCategoryId: parseInt(productCategoryId),
      })
      .where(eq(products.id, productId));

    revalidatePath("/dashboard/produk");
  } catch (error) {
    console.error(error);
    return { error: "Gagal memperbarui produk. Database bermasalah." };
  }
}

export async function deleteProduct(productId: string) {
  const id = Number(productId);

  try {
    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/dashboard/produk");
  } catch (error) {
    console.error(error);
    return { error: "Gagal menghapus produk, Database bermasalah." };
  }
}
