import { toTitleCase } from "@/lib/utils";
import TableContent from "./tableContent";

type listKodeTwoOutOfFiveType = Record<string, string[][]>[];

export default function TableBlock({
  namaTabel,
  dataTabel,
  totalKode,
}: {
  namaTabel: string;
  dataTabel: listKodeTwoOutOfFiveType;
  totalKode: number;
}) {
  return (
    <>
      <section className="flex flex-col gap-2">
        <p className="font-medium">
          {toTitleCase(namaTabel)} ({totalKode} kode)
        </p>
        {dataTabel.map((data, index) => {
          const [key, listKode] = Object.entries(data)[0];
          return <TableContent key={index} nilai={key} listKode={listKode} />;
        })}
      </section>
    </>
  );
}
