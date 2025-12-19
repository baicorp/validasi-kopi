import { toTitleCase } from "@/lib/utils";
import TableContent from "./tableContent";
import { FormatedExamsData } from "@/lib/types";

export default function ExamsTable({
  formatedExamsData,
}: {
  formatedExamsData: FormatedExamsData;
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
