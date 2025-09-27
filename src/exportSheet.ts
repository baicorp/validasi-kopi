import { SoalUjiClientStructure } from "./lib/types";

export async function export_data(
  data: SoalUjiClientStructure[],
  nama: string,
) {
  /* dynamically import the SheetJS Wrapper */
  const XLSX = await import("./sheetWrapper");
  const wb = XLSX.utils.book_new();
  const aoa: string[][] = [];

  for (const tipeUji of data) {
    aoa.push([tipeUji.tipeUjian]);
    for (const uji of tipeUji.soal) {
      Object.keys(uji).forEach((key) => {
        aoa.push([key]);
        const listKode = uji[key];
        for (const arrKode of listKode) {
          aoa.push(arrKode);
        }
      });
    }
    aoa.push([]);
  }
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFileXLSX(wb, `${nama}.xlsx`);
}
