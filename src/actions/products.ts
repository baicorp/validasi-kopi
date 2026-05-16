"use server";

import { db } from "@/db";
import { toTitleCase } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { isValidRole } from "./validateSession";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { productCategories, products } from "@/db/schema";

export async function addProduct(formData: FormData) {
  const productName = (formData.get("product-name") as string).trim();
  const productCategoryId = (formData.get("product-category") as string).trim();

  if (!productName || !productCategoryId) {
    return { error: "Nama dan kategori produk harus di isi" };
  }

  const isValid = await isValidRole("admin");
  if (!isValid) {
    return { error: "401 : Anda tidak memiliki izin." };
  }

  try {
    await db.insert(products).values({
      productName: toTitleCase(productName),
      productCategoryId,
    });

    revalidatePath("/dashboard/produk");
    return { success: true };
  } catch (error) {
    const isDuplicate =
      error instanceof Error && error.message.toLowerCase().includes("unique");
    if (isDuplicate) {
      return {
        error: `Gagal menambahkan produk. Produk ${toTitleCase(productName)} sudah ada.`,
      };
    }
    console.error(error);
    return { error: "Gagal menambahkan produk. Database bermasalah." };
  }
}

export async function getAllProduct(
  page: number = 1,
  search?: string,
  categoryId?: string,
) {
  const limit = 12;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(like(products.productName, `%${search}%`));
  if (categoryId) conditions.push(eq(products.productCategoryId, categoryId));

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const getTotal = db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(conditions.length ? and(...conditions) : undefined);

    const getProducts = db
      .select({
        id: products.id,
        productName: products.productName,
        categoryName: productCategories.categoryName,
        productCategoryId: productCategories.id,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(
        productCategories,
        eq(products.productCategoryId, productCategories.id),
      )
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const [[{ count }], data] = await Promise.all([getTotal, getProducts]);

    return {
      data,
      page,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mengambil data produk, Database bermasalah." };
  }
}

export async function getProductsByCategory(productId: string) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    return await db
      .select({ id: products.id, productName: products.productName })
      .from(products)
      .where(eq(products.productCategoryId, productId));
  } catch (error) {
    console.error(error);
    return {
      error: `Gagal mengambil data produk dengan id kategori ${productId}, Database bermasalah.`,
    };
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  const productName = (formData.get("product-name") as string).trim();
  const productCategoryId = (formData.get("product-category") as string).trim();

  if (!productName || !productCategoryId) {
    return { error: "Nama dan id kategori produk harus di isi." };
  }

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const result = await db
      .update(products)
      .set({
        productName: productName,
        productCategoryId: productCategoryId,
      })
      .where(eq(products.id, productId));

    revalidatePath("/dashboard/produk");
    return result.rows;
  } catch (error) {
    console.error(error);
    return { error: "Gagal memperbarui produk. Database bermasalah." };
  }
}

export async function deleteProduct(id: string) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    await db.delete(products).where(eq(products.id, id));
    revalidatePath("/dashboard/produk");
  } catch (error) {
    console.error(error);
    return { error: "Gagal menghapus produk, Database bermasalah." };
  }
}
