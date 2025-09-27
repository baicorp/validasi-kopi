export type SoalUjiClientStructure = {
  tipeUjian: string;
  soal: Record<string, string[][]>[];
  totalKode: number;
};

// export type JenisUjiType = "uji dasar" | "uji produk";

interface SoalUjiDBStructure {
  kode: string;
  nilai: string;
  sessionUuid: string;
  sessionName: string;
}

export interface SoalUjiDBStructureInsert extends SoalUjiDBStructure {
  namaUjianId: number;
}

export interface SoalUjiDBStructureRead extends SoalUjiDBStructure {
  id: number;
  namaUjian: string;
  jenisUjian: string;
}
