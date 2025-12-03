import { NormalizedExamData } from "./actions/examSubmissions";
import { formatRawExamsData } from "./lib/utils";
import * as XLSX from "xlsx";

export function export_data(
  examsData: ReturnType<typeof formatRawExamsData>,
  fileName: string,
) {
  // const XLSX = await import("./sheetWrapper");
  const wb = XLSX.utils.book_new();
  const aoa: string[][] = [];

  for (const exam of examsData) {
    aoa.push([exam.examName]);
    for (const value of exam.codeValue) {
      Object.keys(value).forEach((key) => {
        aoa.push([key]);
        const listKode = value[key];
        for (const arrKode of listKode) {
          // Insert blank at index 5 (requires length >= 6)
          if (arrKode.length >= 6) {
            arrKode.splice(5, 0, "");
          }
          // we need to add blank if length >=12 (11 + 1)
          if (arrKode.length >= 12) {
            arrKode.splice(11, 0, "");
          }
          aoa.push(arrKode);
        }
      });
    }
    aoa.push([]);
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFileXLSX(wb, `${fileName}.xlsx`);
}

export function buildExamSheet(
  examNames: string[],
  data: NormalizedExamData[],
) {
  const wb = XLSX.utils.book_new();

  const wsData: string[][] = [];

  // ----------- ROW 1 (TOP HEADER) -----------
  const row1: string[] = ["No", "NIK", "Nama", "Departemen"];

  for (const exam of examNames) {
    row1.push(exam, "", "", ""); // 4 columns per exam
  }

  row1.push("Rata-Rata KPI", "Keterangan");

  // ----------- ROW 2 (SUBHEADERS 1–4) -----------
  const row2: string[] = ["", "", "", ""]; // empty under No/Username/Nama/Dept

  for (let i = 0; i < examNames.length; i++) {
    row2.push("", "1", "2", "3");
  }

  row2.push("", "");

  wsData.push(row1);
  wsData.push(row2);

  // summary data
  data.forEach((summary, index) => {
    let keys = Object.keys(summary);
    keys = keys.slice(1);
    const row = keys.map((key) => {
      const value = summary[key];
      return typeof value === "number"
        ? value.toString()
        : value === null
          ? ""
          : value;
    });
    wsData.push([(index + 1).toString(), ...row]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // ----------- MERGES -----------
  const merges: XLSX.Range[] = [];

  // Merge No, NIK, Nama, Departemen (each down 2 rows)
  merges.push({ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }); // No
  merges.push({ s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }); // NIK
  merges.push({ s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }); // Nama
  merges.push({ s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }); // Departemen

  // Merge each exam name over 4 columns
  let col = 4; // START HERE
  for (let i = 0; i < examNames.length; i++) {
    merges.push({
      s: { r: 0, c: col },
      e: { r: 0, c: col + 3 }, // span 4 columns
    });
    col += 4;
  }

  // Merge KPI
  merges.push({
    s: { r: 0, c: col },
    e: { r: 1, c: col },
  });

  // Merge Keterangan
  merges.push({
    s: { r: 0, c: col + 1 },
    e: { r: 1, c: col + 1 },
  });

  ws["!merges"] = merges;

  ws["!cols"] = [
    { wch: 5 }, // No
    { wch: 15 }, // NIK
    { wch: 18 }, // Nama
    { wch: 18 }, // Departemen
    ...Array(examNames.length * 4).fill({ wch: 8 }), // 4 cols per exam
    { wch: 14 }, // KPI
    { wch: 14 }, // Keterangan
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFileXLSX(wb, `${new Date().toLocaleString()}.xlsx`);
}
