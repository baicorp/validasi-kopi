import { formatRawExamsData } from "./lib/utils";

export async function export_data(
  examsData: ReturnType<typeof formatRawExamsData>,
  fileName: string,
) {
  const XLSX = await import("./sheetWrapper");
  const wb = XLSX.utils.book_new();
  const aoa: string[][] = [];

  for (const exam of examsData) {
    aoa.push([exam.examName]);
    for (const value of exam.codeValue) {
      Object.keys(value).forEach((key) => {
        aoa.push([key]);
        const listKode = value[key];
        for (const arrKode of listKode) {
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
