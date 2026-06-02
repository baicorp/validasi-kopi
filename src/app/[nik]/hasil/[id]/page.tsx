import Link from "next/link";
import { Home } from "lucide-react";
import { redirect } from "next/navigation";
import { cn, toTitleCase } from "@/lib/utils";
import Callout from "@/components/ui/callout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getUserLatestExamResult } from "@/actions/examSubmissions";
import { validateSessionServer } from "@/actions/validateSession";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; nik: string }>;
}) {
  const session = await validateSessionServer();
  if (session.user.role !== "user") {
    redirect("/dashboard/ujian");
  }

  const { id, nik } = await params;
  const data = await getUserLatestExamResult(id);

  if ("error" in data) {
    return <ErrorGetData errorMessage={data.error || ""} />;
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

function ErrorGetData({ errorMessage }: { errorMessage: string }) {
  return (
    <div>
      <div className="flex justify-center">
        <svg
          width="180"
          height="160"
          viewBox="0 0 180 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="38"
            y="28"
            width="104"
            height="116"
            rx="10"
            fill="white"
            stroke="#e4e4e7"
            stroke-width="1.5"
          ></rect>
          <rect
            x="68"
            y="20"
            width="44"
            height="16"
            rx="5"
            fill="white"
            stroke="#e4e4e7"
            stroke-width="1.5"
          ></rect>
          <rect
            x="78"
            y="24"
            width="24"
            height="7"
            rx="3.5"
            fill="#e4e4e7"
          ></rect>
          <rect
            x="54"
            y="60"
            width="72"
            height="7"
            rx="3.5"
            fill="#f4f4f5"
          ></rect>
          <rect
            x="54"
            y="74"
            width="52"
            height="7"
            rx="3.5"
            fill="#f4f4f5"
          ></rect>
          <rect
            x="54"
            y="88"
            width="64"
            height="7"
            rx="3.5"
            fill="#f4f4f5"
          ></rect>
          <rect
            x="54"
            y="102"
            width="40"
            height="7"
            rx="3.5"
            fill="#f4f4f5"
          ></rect>
          <circle cx="90" cy="84" r="28" fill="#f4f4f5"></circle>
          <text
            x="90"
            y="93"
            text-anchor="middle"
            font-size="30"
            font-weight="700"
            fill="#d4d4d8"
            font-family="ui-sans-serif,system-ui,sans-serif"
          >
            ?
          </text>
          <circle cx="148" cy="48" r="5" fill="#e4e4e7"></circle>
          <circle cx="158" cy="62" r="3" fill="#f4f4f5"></circle>
          <circle cx="32" cy="110" r="4" fill="#e4e4e7"></circle>
          <circle cx="24" cy="96" r="2.5" fill="#f4f4f5"></circle>
          <circle
            cx="142"
            cy="110"
            r="16"
            fill="white"
            stroke="#e4e4e7"
            stroke-width="1.5"
          ></circle>
          <text
            x="142"
            y="115"
            text-anchor="middle"
            font-size="14"
            font-weight="700"
            fill="#d4d4d8"
            font-family="ui-sans-serif,system-ui,sans-serif"
          >
            0
          </text>
        </svg>
      </div>
      {errorMessage === "Anda belum pernah melakukan ujian." ? (
        <div>
          <p className="font-semibold text-center">{errorMessage}</p>
          <p className="text-muted-foreground text-center text-sm">
            Kamu belum pernah mengikuti ujian ini. Hasil ujian akan muncul di
            sini{" "}
            <span className="font-semibold">
              {" "}
              setelah kamu menyelesaikan ujian pertamamu.
            </span>
          </p>
        </div>
      ) : (
        <div>
          <p className="font-semibold text-center">{errorMessage}</p>
        </div>
      )}
      <Button className="mx-auto w-full md:w-fit flex gap-2 items-center mt-2.5">
        <Home size={18} />
        <Link href={`/`}>Halaman utama</Link>
      </Button>
    </div>
  );
}
