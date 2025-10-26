"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { user } from "@/db/schema";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { isValidRole } from "./validateSession";

export async function addEmployee(formData: FormData) {
  const nik = formData.get("employee-nik") as string;
  const name = formData.get("employee-name") as string;
  const position = formData.get("employee-position") as string;

  if (!nik.trim() || !name.trim() || !position.trim()) {
    return { error: "Lengkapi semua data karyawan." };
  }

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const newEmployee = await auth.api.createUser({
      body: {
        name,
        email: `${nik}@mail.com`,
        password: "supersecure", // so all user have default password supersecure
        role: "user",
        data: { username: nik, position },
      },
    });

    if ("error" in newEmployee) {
      return {
        error: "Gagal menambahkan karyawan, pastikan NIK belum ditambahkan.",
      };
    }

    revalidatePath("/dashboard/karyawan");
    return newEmployee;
  } catch (error) {
    console.error(error);
    return { error: "Gagal menambahkan karyawan baru." };
  }
}

export async function getAllEmployees(
  page: number = 1,
  search: string | undefined,
) {
  const limit = 12;
  const offset = (page - 1) * limit;

  const conditions = [eq(user.role, "user")];
  if (search) conditions.push(like(user.name, `%${search}%`));

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(conditions.length ? and(...conditions) : undefined);

    const data = await db
      .select()
      .from(user)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      page,
      totalPages: Math.ceil(count / limit),
    };
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan daftar karyawan" };
  }
}

export async function updateEmployee(id: string, formData: FormData) {
  const nik = formData.get("employee-nik") as string;
  const name = formData.get("employee-name") as string;
  const position = formData.get("employee-position") as string;

  if (!nik.trim() || !name.trim() || !position.trim()) {
    return { error: "Lengkapi semua data karyawan." };
  }

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const result = await auth.api.adminUpdateUser({
      body: {
        userId: id,
        data: { name, username: nik, position },
      },
      headers: await headers(),
    });

    revalidatePath("/dashboard/karyawan");
    return result;
  } catch (error) {
    console.error(error);
    return { error: "Gagal memperbarui karyawan." };
  }
}

export async function deleteEmployee(id: string) {
  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    await auth.api.removeUser({
      body: {
        userId: id,
      },
      headers: await headers(),
    });
    revalidatePath("/dashboard/karyawan");
  } catch (error) {
    console.error(error);
    return { error: `Gagal menghapus karyawan (id: ${id})` };
  }
}
