"use server";

import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { jenisUjian, kode, namaUjian } from "@/db/schema";
import { SoalUjiDBStructureRead, SoalUjiDBStructureInsert } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function saveSoalUji(ujiDasar: SoalUjiDBStructureInsert[]) {
  if (ujiDasar.length === 0) {
    throw new Error("Soal uji dasar kosong.");
  }

  try {
    await db.insert(kode).values(ujiDasar);
    revalidatePath("/dashboard/list-soal");
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error("Gagal menyimpan soal uji dasar ke database.");
  }
}

export async function deleteSoalUji(sessionUUID: string) {
  try {
    await db.delete(kode).where(eq(kode.sessionUuid, sessionUUID));
    revalidatePath("/dashboard/list-soal");
  } catch (e) {
    if (e instanceof Error) {
      // throw e;
    }
    throw new Error(`Gagal menghapus soal ${sessionUUID} dari database.`);
  }
}

export async function getTableData(
  id: string,
): Promise<SoalUjiDBStructureRead[]> {
  try {
    return await db
      .select({
        id: kode.id,
        sessionUuid: kode.sessionUuid,
        sessionName: kode.sessionName,
        kode: kode.kode,
        nilai: kode.nilai,
        namaUjian: namaUjian.namaUjian,
        jenisUjian: jenisUjian.jenisUjian,
      })
      .from(kode)
      .innerJoin(namaUjian, eq(kode.namaUjianId, namaUjian.id))
      .innerJoin(jenisUjian, eq(namaUjian.jenisUjianId, jenisUjian.id))
      .where(eq(kode.sessionUuid, id));
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error("Gagal membaca data tabel dari database.");
  }
}

export async function getListSoal() {
  try {
    return await db
      .selectDistinct({
        session_uuid: kode.sessionUuid,
        session_name: kode.sessionName,
      })
      .from(kode)
      .orderBy(desc(kode.createdAt));
  } catch (e) {
    if (e instanceof Error) {
      throw e;
    }
    throw new Error("Gagal mendapat list soal dari database.");
  }
}
