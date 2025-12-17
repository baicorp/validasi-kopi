import * as XLSX from "xlsx";
import { formatRawExamsData } from "./lib/utils";

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
