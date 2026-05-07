import Link from "next/link";
import { Home } from "lucide-react";
import { cn, toTitleCase } from "@/lib/utils";
import Callout from "@/components/ui/callout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getUserLatestExamResult } from "@/actions/examSubmissions";

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

  const numberAttempt = data.examResults[0].numberAttempt;

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <p className="font-semibold text-sm text-muted-foreground text-center">
          HASIL UJIAN
        </p>
        <p className="w-2/3 mx-auto text-xl font-semibold text-center">
          {data.examEventName}
        </p>
        <Badge className="block mx-auto mt-1 bg-blue-500">
          {numberAttempt === 1
            ? "UJIAN REGULER"
            : `UJIAN MENGULANG ${numberAttempt - 1} / 3`}
        </Badge>
        {numberAttempt === 4 && (
          <Callout className="my-4 border border-blue-200 bg-blue-50 text-blue-500 font-semibold">
            <p>
              TERIMAKASIH SUDAH MENYELASAIKAN UJIAN VALIDASI. HASIL UJIAN KE 3
              (TERAKHIR) AKAN DI INFOKAN BY IM.
            </p>
          </Callout>
        )}
        <Separator className="my-4" />
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground font-medium text-sm">
            RINCIAN HASIL UJIAN
          </p>
          {data.examResults.map((result) => (
            <ExamResultItem
              key={result.id}
              examName={result.examName}
              numberAttempt={result.numberAttempt}
              retake={result.retake}
            />
          ))}
          <div className="flex justify-center pt-2">
            <Button className="flex gap-2 items-center basis-full">
              <Home size={18} />
              <Link href={`/${nik}`}>Halaman utama</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamResultItem({
  examName,
  numberAttempt,
  retake,
}: {
  examName: string | null;
  numberAttempt: number;
  retake: string | null;
}) {
  return (
    <div className="flex justify-between items-center border rounded-lg overflow-hidden">
      <div
        className={cn(
          `pl-3.5 py-3 border-l-4 ${retake ? "border-red-300" : "border-green-300"}`,
          numberAttempt === 4 && "border-none",
        )}
      >
        <p className="font-semibold">{toTitleCase(examName ?? "")}</p>
        <p className="text-muted-foreground text-sm">
          {numberAttempt === 1
            ? "Ujian Reguler"
            : `Ujian mengulang ${numberAttempt - 1} / 3`}
        </p>
      </div>
      {numberAttempt !== 4 && (
        <div className="mr-3.5">
          <div
            className={`border ${retake ? "bg-red-50 text-red-600 border-red-200" : "bg-green-50 text-green-600 border-green-200"} px-2.5 py-1 rounded-full`}
          >
            <p className="text-center font-semibold text-sm">
              {retake ? "Mengulang" : "Lolos"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
