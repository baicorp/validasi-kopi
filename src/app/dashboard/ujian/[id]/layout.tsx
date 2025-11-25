import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import ErrorComp from "@/components/ui/error";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, ExternalLink } from "lucide-react";
import Loading from "@/components/skeleton/loading";
import { getExamEventById } from "@/actions/examEvents";
import { formatLocalTime, getDurationString } from "@/lib/datetimeFormat";

export default async function Layout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return (
    <>
      <section>
        <div className="flex gap-3 my-3">
          <Link href={`peserta-ujian`}>Peserta ujian</Link>
          <Link href={`rekap-jawaban`}>Rekap jawaban</Link>
          <Link href={`hasil-ujian`}>Hasil ujian</Link>
        </div>
        <Suspense fallback={<Loading />}>
          <ExamEventDetails examEventId={id} />
        </Suspense>
      </section>
      {children}
    </>
  );
}

async function ExamEventDetails({ examEventId }: { examEventId: string }) {
  const examEvent = await getExamEventById(examEventId);

  if ("error" in examEvent) {
    return <ErrorComp error={examEvent.error} />;
  }

  return (
    <div className="space-y-6 border rounded-lg px-6 py-4">
      <div>
        <p className="text-lg font-semibold">
          <span>{examEvent.examEventName}</span>
          <span className="text-muted-foreground"> (# {examEvent.id})</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          {examEvent.selectedExams?.split(",")?.map((exam) => (
            <Badge variant={"secondary"} key={exam}>
              {exam}
            </Badge>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-4">
        <div className="space-y-2 justify-self-start">
          <Label className="text-muted-foreground">TANGGAL / WAKTU UJIAN</Label>
          <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 gap-y-1 text-sm">
            <p>Mulai</p>
            <span> : </span>
            <div className="flex gap-2 items-center">
              <Calendar className="w-4 h-4" />
              <p>{formatLocalTime(examEvent.examStart)}</p>
            </div>
            <p>Selesai</p>
            <span> : </span>
            <div className="flex gap-2 items-center">
              <Calendar className="w-4 h-4" />
              <p>{formatLocalTime(examEvent.examEnd)}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2 justify-self-center">
          <Label className="text-muted-foreground">LAMA PENGERJAAN</Label>
          <div className="flex gap-2 items-center">
            <Clock className="w-4 h-4" />
            <p>{getDurationString(examEvent.examStart, examEvent.examEnd)}</p>
          </div>
        </div>
        <div className="space-y-2 justify-self-center">
          <Label className="text-muted-foreground">LINK BANK SOAL</Label>
          <div className="flex flex-col">
            <Link
              href={`/dashboard/daftar-soal/${examEvent.codeGroupRegulerId}`}
              className="flex gap-1 items-center text-blue-700 hover:underline hover:decoration-wavy"
            >
              <span className="text-sm">Soal reguler</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href={`/dashboard/daftar-soal/${examEvent.codeGroupRetakeId}`}
              className="flex gap-1 items-center text-blue-700 hover:underline hover:decoration-wavy"
            >
              <span className="text-sm">Soal mengulang</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
        <div className="space-y-2 justify-self-end">
          <Label className="text-muted-foreground">KUOTA PESERTA UJIAN</Label>
          <div>
            <p>{examEvent.totalParticipants} Orang</p>
          </div>
        </div>
      </div>
    </div>
  );
}
