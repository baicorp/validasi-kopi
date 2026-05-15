import React from "react";
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
import {
  calculateExamResultsWithCompletionCheck,
  combineTresholdData,
} from "@/lib/evaluateFinal";
import ExportSummary from "@/components/ui/exportSummary";

export default async function page({
  params,
}: {
  params: Promise<{ examEventId: string }>;
}) {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/${session.user.username}`);
  }

  const { examEventId } = await params;
  const results = await getSubmissionAttemptSummary(examEventId);

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
      {results.selectedExams.includes("treshold mix") ? (
        <>
          <ThresholdTable data={results} />
          <BasicExamTable data={results} />
        </>
      ) : (
        <ProductExamTable data={results} />
      )}
    </div>
  );
}

function ProductExamTable({
  data,
}: {
  data: { selectedExams: string; rowData: NormalizedExamData[] };
}) {
  const calculateFinal = calculateExamResultsWithCompletionCheck(data.rowData);
  // remove all object with key containing "additional",
  // because it's not needed for product exam table
  const cleanProductExamData = calculateFinal.map((item) => {
    return Object.fromEntries(
      Object.entries(item).filter(([key]) => !key.includes("additional")),
    );
  });

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
        {cleanProductExamData.map((row, index) => {
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
                    className={`font-mono border border-neutral-400 border-collapse text-center ${typeof row[data] === "number" && row[data] < 70 && "text-red-500"}`}
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

function ThresholdTable({
  data,
}: {
  data: { selectedExams: string; rowData: NormalizedExamData[] };
}) {
  // only include keys with "treshold" for this table
  const cleanTresholdExamData = data.rowData.map((item) => {
    return Object.fromEntries(
      Object.entries(item).filter(
        ([key]) => key.includes("treshold") || key == "name",
      ),
    );
  });

  return (
    <Table className="border border-neutral-400 border-collapse rounded-md">
      <TableHeader>
        <TableRow className="border border-neutral-400 border-collapse">
          <TableHead
            rowSpan={3}
            className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-10"
          >
            No
          </TableHead>
          <TableHead
            rowSpan={3}
            className="border border-neutral-400 bg-neutral-100 border-collapse text-center"
          >
            Nama
          </TableHead>
          <TableHead
            colSpan={4}
            rowSpan={2}
            className="border border-neutral-400 bg-neutral-100 border-collapse text-center"
          >
            Treshold Mix
          </TableHead>
          <TableHead
            colSpan={8}
            className="border border-neutral-400 bg-neutral-100 border-collapse text-center"
          >
            Treshold Single
          </TableHead>
        </TableRow>

        <TableRow className="border border-neutral-400 border-collapse">
          <>
            <TableHead
              colSpan={2}
              className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-12"
            ></TableHead>
            <TableHead
              colSpan={2}
              className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-12"
            >
              1
            </TableHead>
            <TableHead
              colSpan={2}
              className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-12"
            >
              2
            </TableHead>
            <TableHead
              colSpan={2}
              className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-12"
            >
              3
            </TableHead>
          </>
        </TableRow>
        <TableRow className="border border-neutral-400 border-collapse">
          <HeaderTableAttemptNumber />
          <>
            {[1, 2, 3, 4].map((index) => (
              <React.Fragment key={index}>
                <TableHead className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-12">
                  Rasa
                </TableHead>
                <TableHead className="border border-neutral-400 bg-neutral-100 border-collapse text-center w-12">
                  Skor
                </TableHead>
              </React.Fragment>
            ))}
          </>
        </TableRow>
      </TableHeader>

      <TableBody>
        {cleanTresholdExamData.map((row, index) => {
          const keys = Object.keys(row).slice(1);
          return (
            <TableRow
              key={index}
              className="border border-neutral-400 border-collapse"
            >
              <TableCell className="border border-neutral-400 border-collapse">
                {index + 1}
              </TableCell>
              <TableCell className="border border-neutral-400 border-collapse">
                {row.name}
              </TableCell>
              {keys.map((key) => {
                return (
                  <TableCell
                    key={key}
                    className={`tracking-tighter font-mono border border-neutral-400 border-collapse text-center ${typeof row[key] === "number" && row[key] < 70 && "text-red-500"}`}
                  >
                    {row[key]}
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

function BasicExamTable({
  data,
}: {
  data: { selectedExams: string; rowData: NormalizedExamData[] };
}) {
  const tresholdFinalScore = combineTresholdData(data.rowData);
  const calculateFinal =
    calculateExamResultsWithCompletionCheck(tresholdFinalScore);

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
          {data.selectedExams
            .split(",")
            .map((exam) =>
              exam.includes("treshold") ? null : (
                <HeaderTableExamName key={exam} examName={exam} />
              ),
            )}
          <TableHead
            colSpan={4}
            className="border border-neutral-400 bg-neutral-100 border-collapse text-center"
          >
            Treshold
          </TableHead>
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
          {data.selectedExams
            .split(",")
            .map((exam) =>
              exam.includes("treshold") ? null : (
                <HeaderTableAttemptNumber key={exam} />
              ),
            )}
          <HeaderTableAttemptNumber />
        </TableRow>
      </TableHeader>

      <TableBody>
        {calculateFinal.map((row, index) => {
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
                    className={`font-mono tracking-tighter border border-neutral-400 border-collapse text-center ${typeof row[data] === "number" && row[data] < 70 && "text-red-500"}`}
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
