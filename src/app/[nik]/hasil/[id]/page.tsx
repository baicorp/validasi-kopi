import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toTitleCase } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getUserLatestExamResult } from "@/actions/examSubmissions";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; nik: string }>;
}) {
  const { id, nik } = await params;
  const data = await getUserLatestExamResult(Number(id));
  if ("error" in data) {
    return <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>;
  }

  return (
    <div className="space-y-8">
      <p className="text-xl font-semibold text-center">HASIL UJIAN</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-orange-400 bg-muted py-2 md:text-lg">
              Nama Ujian
            </TableHead>
            <TableHead className="text-orange-400 bg-muted py-2 md:text-lg">
              Kesempatan
            </TableHead>
            <TableHead className="text-orange-400 bg-muted py-2 md:text-lg">
              Nilai
            </TableHead>
            <TableHead className="text-center text-orange-400 bg-muted py-2 md:text-lg">
              Status Mengulang
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium py-4">
                {toTitleCase(invoice.examName ?? "")}
              </TableCell>
              <TableCell className="pl-9 py-4">
                {invoice.numberAttempt}
              </TableCell>
              <TableCell className="py-4">{invoice.grade}</TableCell>
              <TableCell className="text-center py-4">
                <span
                  className={`text-sm rounded-md px-3 p-1 ${invoice.retake ? "text-red-600 bg-red-100 border border-red-200" : "text-green-600 bg-green-100 border border-green-200"}`}
                >
                  {invoice.retake ? "MENGULANG" : "LOLOS"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center">
        <Button>
          <Link href={`/${nik}`}>Kembali</Link>
        </Button>
      </div>
      {/*<pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>;*/}
    </div>
  );
}
