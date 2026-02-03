import { NormalizedExamData } from "./actions/examSubmissions";
import {
  calculateExamResultsWithCompletionCheck,
  combineTresholdData,
} from "./lib/evaluateFinal";
import * as XLSX from "xlsx";
import { formatRawExamsData } from "./lib/utils";

export function export_data(
  examsData: ReturnType<typeof formatRawExamsData>,
  fileName: string,
) {
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

type TableData = {
  [k: string]: string | number | null;
};

export function buildExamSheet(
  examNames: string[],
  data: NormalizedExamData[],
) {
  const wb = XLSX.utils.book_new();

  if (examNames.includes("identifikasi")) {
    const calculateFinal = calculateExamResultsWithCompletionCheck(data);
    // remove all object with key containing "additional",
    // because it's not needed for product exam table
    const tableData: TableData[] = calculateFinal.map((item) => {
      return Object.fromEntries(
        Object.entries(item).filter(([key]) => !key.includes("additional")),
      );
    });
    examTableBuilder(wb, examNames, tableData);
  } else if (examNames.includes("treshold mix")) {
    // treshold table
    TresholdExamTableBuilder(wb, data);

    // final basic exam table
    const tresholdFinalScore = combineTresholdData(data);
    const tableData: TableData[] =
      calculateExamResultsWithCompletionCheck(tresholdFinalScore);
    examNames = examNames.filter((examName) => !examName.includes("treshold"));
    examNames = [...examNames, "Treshold"];
    examTableBuilder(wb, examNames, tableData);
  } else {
    console.log("can't build exam sheet");
  }

  // download generated table file .xlsx
  XLSX.writeFileXLSX(wb, `${new Date().toLocaleString()}.xlsx`);
}

function examTableBuilder(
  wb: XLSX.WorkBook,
  examNames: string[],
  tableData: TableData[],
) {
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
  tableData.forEach((summary, index) => {
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

  const worksheetName = examNames.includes("identifikasi")
    ? "Rekap Nilai Uji Produk"
    : "Rekap Nilai Uji Dasar";
  XLSX.utils.book_append_sheet(wb, ws, worksheetName);
}

function TresholdExamTableBuilder(wb: XLSX.WorkBook, tableData: TableData[]) {
  const wsData: string[][] = [];

  // ----------- ROW 1 (TOP HEADER) -----------
  const row1: string[] = [
    "No",
    "NIK",
    "Nama",
    "Departemen",
    "Treshold Mix",
    "",
    "",
    "",
    "Treshold Single",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ];

  // ----------- ROW 2 (TOP HEADER) -----------
  const row2: string[] = [];
  for (let i = 0; i < 10; i++) {
    row2.push("");
  }
  for (let i = 1; i < 4; i++) {
    row2.push(i.toString(), "");
  }

  // ----------- ROW 3 (TOP HEADER) -----------
  const row3: string[] = ["", "", "", "", "", "1", "2", "3"];
  for (let i = 0; i < 4; i++) {
    row3.push("Rasa", "Skor");
  }

  // push row (HEADER TABLE)
  wsData.push(row1);
  wsData.push(row2);
  wsData.push(row3);

  // only include exams keys with "treshold" for this table
  const trsholdTable = tableData.map((item) => {
    return Object.fromEntries(
      Object.entries(item).filter(
        ([key]) =>
          key.includes("treshold") ||
          key == "name" ||
          key == "departments" ||
          key == "username",
      ),
    );
  });

  // insert data to table body
  trsholdTable.forEach((summary, index) => {
    const keys = Object.keys(summary);
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

  // Merge No, NIK, Nama, Departemen (each down 3 rows)
  merges.push({ s: { r: 0, c: 0 }, e: { r: 2, c: 0 } }); // No
  merges.push({ s: { r: 0, c: 1 }, e: { r: 2, c: 1 } }); // NIK
  merges.push({ s: { r: 0, c: 2 }, e: { r: 2, c: 2 } }); // Nama
  merges.push({ s: { r: 0, c: 3 }, e: { r: 2, c: 3 } }); // Departemen

  // merge examName
  merges.push({
    // merge for treshold mix header
    s: { r: 0, c: 4 },
    e: { r: 1, c: 4 + 3 }, // span 4 columns
  });
  merges.push({
    // merge for treshold single header
    s: { r: 0, c: 8 },
    e: { r: 0, c: 8 + 7 }, // span 8 columns
  });

  for (let i = 0; i < 4; i++) {
    merges.push({
      // merge for number bellow examName header (treshold single)
      s: { r: 1, c: 8 + i * 2 },
      e: { r: 1, c: 8 + i * 2 + 1 }, // span 2 columns
    });
  }

  ws["!merges"] = merges;

  ws["!cols"] = [
    { wch: 5 }, // No
    { wch: 15 }, // NIK
    { wch: 18 }, // Nama
    { wch: 18 }, // Departemen
    ...Array(1 * 4).fill({ wch: 8 }), // 4 cols for treshold mix
    ...Array(1 * 8).fill({ wch: 8 }), // 8 cols for treshold single
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Rekap Nilai Treshold");
}
