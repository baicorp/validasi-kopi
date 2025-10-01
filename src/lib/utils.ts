import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  SoalUjiClientStructure,
  SoalUjiDBStructureInsert,
  SoalUjiDBStructureRead,
} from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArrKeTJ(listKode: string[]): string[][] {
  const jumlahKodePerBaris = 15;
  const listKodeTerformat = [];
  for (let i = 0; i < listKode.length; i += jumlahKodePerBaris) {
    listKodeTerformat.push(listKode.slice(i, i + jumlahKodePerBaris));
  }
  // ex [[1,2,4,5,6,7,8,9,10,11,12,13,14,15], [...]]. setiap baris 15 kode.
  return listKodeTerformat;
}

export function formatToDB(
  sessionName: string, // biar jelas session_name bisa dikasih parameter
  data: SoalUjiClientStructure[],
): SoalUjiDBStructureInsert[] {
  const sessionUuid = crypto.randomUUID(); // sama untuk semua data
  const results: SoalUjiDBStructureInsert[] = [];

  // for (const { tipeUjian, soal } of arrFlatStructure) {
  for (const { tipeUjian, soal } of data) {
    const namaUjianId = getIdJenisUjianFromUjianName(tipeUjian);
    for (const record of soal) {
      for (const key in record) {
        const kodeList = record[key].flat(); // buat array 2D jadi 1D
        for (const kode of kodeList) {
          results.push({
            kode,
            nilai: key,
            sessionUuid,
            sessionName: sessionName,
            namaUjianId,
          });
        }
      }
    }
  }

  return results;
}

// IMPORTANT!!: cocokkan di database
function getIdJenisUjianFromUjianName(namaUjian: string): number {
  switch (namaUjian.toLowerCase()) {
    case "2 out of 5":
      return 1; // id 2 out of 5
    case "treshold single":
      return 3; // id treshold single
    case "treshold mix":
      return 4; // id treshold mix
    case "identifikasi":
      return 2; // id identifikasi
    case "triangle":
      return 5; // id triangle
    case "skoring":
      return 6; // id skoring
    default:
      return 0; // return 0 jika nama ujian tidak cocok
  }
}

// Fungsi transformasi
export function transformDataFromDB(
  data: SoalUjiDBStructureRead[],
): SoalUjiClientStructure[] {
  // group by namaUjian
  const grouped: Record<string, { [nilai: string]: string[] }> = {};

  for (const row of data) {
    const { namaUjian, nilai, kode } = row;

    if (!grouped[namaUjian]) {
      grouped[namaUjian] = {};
    }

    if (!grouped[namaUjian][nilai]) {
      grouped[namaUjian][nilai] = [];
    }

    grouped[namaUjian][nilai].push(kode);
  }

  // transform ke bentuk output
  return Object.entries(grouped).map(([namaUjian, soalMap]) => {
    const soalFormatted: Record<string, string[][]>[] = [];

    for (const nilaiKey in soalMap) {
      const kode2D = formatArrKeTJ(soalMap[nilaiKey]);
      soalFormatted.push({ [nilaiKey]: kode2D });
    }

    // hitung total kode
    const totalKode = Object.values(soalMap).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );

    return {
      tipeUjian: namaUjian,
      soal: soalFormatted.sort((a, b) =>
        Object.keys(a)[0].localeCompare(Object.keys(b)[0]),
      ),
      totalKode,
    };
  });
}

export function toTitleCase(str: string) {
  const strArr = str.toLowerCase().split(" ");

  return strArr
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

// helper untuk pisah rasa + intensitas
function parseSingle(val: string) {
  const [rasa, intensitas] = val.split(" ");
  return { rasa, intensitas };
}

// helper untuk pisah rasa mix
function parseMix(val: string) {
  return val.split("+").map((v) => v.trim());
}

export function codeCheck(
  inputKode: string,
  inputNilai: string,
  listDataKunci: SoalUjiDBStructureRead[],
) {
  const kunci = listDataKunci.find((d) => d.kode === inputKode);
  if (!kunci) return "salah"; // kode tidak ada di kunci

  const jenis = kunci.namaUjian.toLowerCase();
  const nilaiBenar = kunci.nilai;

  if (jenis === "treshold single") {
    const { rasa: rasaInput, intensitas: intenInput } = parseSingle(inputNilai);
    const { rasa: rasaBenar, intensitas: intenBenar } = parseSingle(nilaiBenar);

    if (rasaInput === rasaBenar && intenInput === intenBenar) return "benar";
    if (rasaInput === rasaBenar) return "salah-sebagian";
    return "salah";
  }

  if (jenis === "treshold mix") {
    const inputRasa = parseMix(inputNilai);
    const kunciRasa = parseMix(nilaiBenar);

    const cocok = inputRasa.filter((r) => kunciRasa.includes(r)).length;

    if (cocok === 2) return "benar";
    if (cocok === 1) return "salah-sebagian";
    return "salah";
  }

  return inputNilai === nilaiBenar ? "benar" : "salah";
}
