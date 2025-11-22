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
import { getLatestExamResult } from "@/actions/examSubmissions";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; nik: string }>;
}) {
  const { id, nik } = await params;
  const data = await getLatestExamResult(Number(id));
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
              <TableCell className="font-medium">
                {toTitleCase(invoice.examName ?? "")}
              </TableCell>
              <TableCell className="pl-9">{invoice.numberAttempt}</TableCell>
              <TableCell>{invoice.grade}</TableCell>
              <TableCell
                className={`text-center font-bold ${invoice.retake ? "text-red-400" : "text-green-500"}`}
              >
                {invoice.retake ? "MENGULANG" : "LOLOS"}
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
