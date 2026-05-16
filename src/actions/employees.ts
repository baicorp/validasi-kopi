"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import { departments, plantAreas, user } from "@/db/schema";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isValidRole } from "./validateSession";
import { and, desc, eq, like, or, sql } from "drizzle-orm";

export async function addEmployee(formData: FormData) {
  const nik = formData.get("employee-nik") as string;
  const name = formData.get("employee-name") as string;
  const position = formData.get("employee-position") as string;
  const department = formData.get("employee-department") as string;
  const plantArea = formData.get("employee-plant-area") as string;

  if (
    !nik.trim() ||
    !name.trim() ||
    !position.trim() ||
    !department.trim() ||
    !plantArea.trim()
  ) {
    return { error: "Lengkapi semua data karyawan." };
  }

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    if (!process.env.USER_DEFAULT_PASSWORD) {
      return { error: "Tidak dapat membaca user default password." };
    }

    const newEmployee = await auth.api.createUser({
      body: {
        name,
        email: `${nik}@mail.com`,
        password: process.env.USER_DEFAULT_PASSWORD!,
        role: "user",
        data: {
          username: nik,
          position,
          departmentId: department,
          plantAreaId: plantArea,
        },
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

export async function getAllEmployees(page: number = 1, search?: string) {
  const limit = 12;
  const offset = (page - 1) * limit;

  const conditions = [eq(user.role, "user")];
  if (search) {
    conditions.push(
      // @ts-expect-error NOTE: This expression works correctly at runtime,
      // but TypeScript infers incompatible types for `or()` with dynamic LIKE conditions.
      or(like(user.name, `%${search}%`), like(user.username, `%${search}%`)),
    );
  }

  try {
    const isValid = await isValidRole("admin");
    if (!isValid) {
      return { error: "401 : Anda tidak memiliki izin." };
    }

    const getTotal = db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .leftJoin(departments, eq(user.departmentId, departments.id))
      .leftJoin(plantAreas, eq(user.plantAreaId, plantAreas.id))
      .where(conditions.length ? and(...conditions) : undefined);

    const getData = db
      .select({
        id: user.id,
        username: user.username,
        name: user.name,
        position: user.position,
        departmentId: departments.id,
        department: departments.departmentName,
        plantAreaId: plantAreas.id,
        plantArea: plantAreas.areaName,
      })
      .from(user)
      .leftJoin(departments, eq(user.departmentId, departments.id))
      .leftJoin(plantAreas, eq(user.plantAreaId, plantAreas.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    const [[{ count }], data] = await Promise.all([getTotal, getData]);

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
  const department = formData.get("employee-department") as string;
  const plantArea = formData.get("employee-plant-area") as string;

  if (
    !nik.trim() ||
    !name.trim() ||
    !position.trim() ||
    !plantArea.trim() ||
    !department.trim()
  ) {
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
        data: {
          username: nik,
          name,
          position,
          departmentId: Number(department),
          plantAreaId: Number(plantArea),
        },
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

export async function getPlantAreas() {
  try {
    return await db
      .select({ id: plantAreas.id, areaName: plantAreas.areaName })
      .from(plantAreas);
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan area pabrik." };
  }
}

export async function getDepartments() {
  try {
    return await db
      .select({
        id: departments.id,
        departmentName: departments.departmentName,
      })
      .from(departments);
  } catch (error) {
    console.error(error);
    return { error: "Gagal mendapatkan data departemen." };
  }
}
