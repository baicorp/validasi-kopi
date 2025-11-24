import TableContent from "./tableContent";
import { formatRawExamsData, toTitleCase } from "@/lib/utils";

export default function ExamsTable({
  formatedExamsData,
}: {
  formatedExamsData: ReturnType<typeof formatRawExamsData>;
}) {
  return (
    <section className="flex flex-col gap-4">
      {formatedExamsData.map((exam) => (
        <div key={exam.examName} className="flex flex-col gap-3">
          <p className="font-medium">{toTitleCase(exam.examName)}</p>
          {exam.codeValue.map((data, index) => {
            const [key, listKode] = Object.entries(data)[0];
            return <TableContent key={index} nilai={key} listKode={listKode} />;
          })}
        </div>
      ))}
    </section>
  );
}
