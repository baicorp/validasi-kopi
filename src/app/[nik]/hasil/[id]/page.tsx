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
import Callout from "@/components/ui/callout";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; nik: string }>;
}) {
  const { id, nik } = await params;
  const data = await getUserLatestExamResult(id);

  if ("error" in data) {
    return <pre className="text-sm">{JSON.stringify(data, null, 2)}</pre>;
  }

  return (
    <div className="flex justify-center">
      <div className="space-y-8 w-full max-w-3xl">
        <p className="text-xl font-semibold text-center">HASIL UJIAN</p>
        {data[0]?.numberAttempt === 4 && (
          <Callout className="border border-blue-200 bg-blue-50 text-blue-500 font-semibold">
            <p>
              TERIMAKASIH SUDAH MENYELASAIKAN UJIAN VALIDASI. HASIL UJIAN KE 3
              (TERAKHIR) AKAN DI INFOKAN BY IM.
            </p>
          </Callout>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-orange-400 bg-muted py-2 md:text-lg">
                Nama ujian
              </TableHead>
              <TableHead className="text-orange-400 bg-muted py-2 md:text-lg">
                Deskripsi ujian
              </TableHead>
              {data[0]?.numberAttempt !== 4 && (
                <TableHead className="text-center text-orange-400 bg-muted py-2 md:text-lg">
                  Hasil ujian
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium py-4">
                  {toTitleCase(invoice.examName ?? "")}
                </TableCell>
                <TableCell className="py-4">
                  {invoice.numberAttempt === 1
                    ? "Reguler"
                    : `Ujian mengulang yang ke ${invoice.numberAttempt - 1} / 3`}
                </TableCell>
                {invoice.numberAttempt !== 4 && (
                  <TableCell className="text-center py-4">
                    <span
                      className={`text-sm rounded-md px-3 p-1 ${invoice.retake ? "text-red-600 bg-red-100 border border-red-200" : "text-green-600 bg-green-100 border border-green-200"}`}
                    >
                      {invoice.retake ? "MENGULANG" : "LOLOS"}
                    </span>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-center">
          <Button>
            <Link href={`/${nik}`}>Kembali</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
