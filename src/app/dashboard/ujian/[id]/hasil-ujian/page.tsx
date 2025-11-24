import { redirect } from "next/navigation";
import { validateSessionServer } from "@/actions/validateSession";
import {
  getSubmissionAttemptSummary,
  NormalizedExamData,
} from "@/actions/examSubmissions";
import ErrorComp from "@/components/ui/error";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ExportSummary from "@/components/ui/exportSummary";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/user/${session.user.username}`);
  }

  const { id } = await params;
  const results = await getSubmissionAttemptSummary(id);

  if ("error" in results) {
    return <ErrorComp error={results.error} />;
  }

  return (
    <div className="space-y-4">
      <p className="text-center font-semibold text-lg">Rangkuman Hasil Ujian</p>
      <div className="flex justify-end">
        <ExportSummary
          listExams={results.selectedExams.split(",")}
          data={results.rowData}
        />
      </div>
      <CustomTable data={results} />
    </div>
  );
}

function CustomTable({
  data,
}: {
  data: { selectedExams: string; rowData: NormalizedExamData[] };
}) {
  return (
    <Table className="border border-neutral-400 border-collapse rounded-md">
      <TableHeader>
        <TableRow className="border border-neutral-400 border-collapse">
          <TableHead
            rowSpan={2}
            className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-10"
          >
            No
          </TableHead>
          <TableHead
            rowSpan={2}
            className="border border-neutral-400 bg-neutral-100 border-collapse text-center"
          >
            Nama
          </TableHead>
          {data.selectedExams.split(",").map((exam) => (
            <HeaderTableExamName key={exam} examName={exam} />
          ))}
          <TableHead
            rowSpan={2}
            className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-28"
          >
            Rata-Rata KPI
          </TableHead>
          <TableHead
            rowSpan={2}
            className="border border-neutral-400 bg-neutral-100 border-collapse text-center"
          >
            Keterangan
          </TableHead>
        </TableRow>

        <TableRow className="border border-neutral-400 border-collapse">
          {data.selectedExams.split(",").map((exam) => (
            <HeaderTableAttemptNumber key={exam} />
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.rowData.map((row, index) => {
          const keys = Object.keys(row).slice(4);
          return (
            <TableRow
              key={row.userId}
              className="border border-neutral-400 border-collapse"
            >
              <TableCell className="border border-neutral-400 border-collapse">
                {index + 1}
              </TableCell>
              <TableCell className="border border-neutral-400 border-collapse">
                {row.name}
              </TableCell>
              {keys.map((data) => {
                return (
                  <TableCell
                    key={data}
                    className={`border border-neutral-400 border-collapse text-center ${typeof row[data] === "number" && row[data] < 70 && "text-red-500"}`}
                  >
                    {data === "averageGrade" || data === "result"
                      ? row[data] === null
                        ? "belum lengkap"
                        : row[data]
                      : row[data]}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function HeaderTableExamName({ examName }: { examName: string }) {
  return (
    <>
      <TableHead
        colSpan={4}
        className="border border-neutral-400 bg-neutral-100 border-collapse text-center"
      >
        {examName}
      </TableHead>
    </>
  );
}

function HeaderTableAttemptNumber() {
  return (
    <>
      <TableHead className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-12"></TableHead>
      <TableHead className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-12">
        1
      </TableHead>
      <TableHead className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-12">
        2
      </TableHead>
      <TableHead className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-12">
        3
      </TableHead>
    </>
  );
}
