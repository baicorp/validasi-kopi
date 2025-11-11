import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import ErrorComp from "@/components/ui/error";
import { Label } from "@/components/ui/label";
import { Calendar, Clock } from "lucide-react";
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
  const examEvent = await getExamEventById(Number(examEventId));

  if ("error" in examEvent) {
    return <ErrorComp error={examEvent.error} />;
  }

  return (
    <div className="space-y-3 border rounded-lg px-6 py-6">
      <div className="flex gap-2 items-center">
        <p className="text-lg font-semibold">{examEvent.examEventName}</p>
        <p className="text-muted-foreground">(# {examEvent.id})</p>
      </div>
      <div className="grid grid-cols-3">
        <div className="space-y-2">
          <Label className="text-muted-foreground">DAFTAR UJIAN</Label>
          <div className="flex flex-wrap gap-1.5">
            {examEvent.selectedExams?.split(",")?.map((exam) => (
              <Badge variant={"secondary"} key={exam}>
                {exam}
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2 justify-self-center">
          <Label className="text-muted-foreground">TANGGAL / WAKTU UJIAN</Label>
          <div className="flex gap-2 items-center text-sm">
            <p>Mulai :</p>
            <Calendar className="w-4 h-4" />
            <p>{formatLocalTime(examEvent.examStart)}</p>
          </div>
          <div className="flex gap-2 items-center text-sm">
            <p>Selesai : </p>
            <Calendar className="w-4 h-4" />
            <p>{formatLocalTime(examEvent.examEnd)}</p>
          </div>
        </div>
        <div className="justify-self-end space-y-2">
          <div className="space-y-1">
            <Label className="text-muted-foreground">LAMA PENGERJAAN</Label>
            <div className="flex gap-2 items-center">
              <Clock className="w-4 h-4" />
              <p>{getDurationString(examEvent.examStart, examEvent.examEnd)}</p>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground">KUOTA PESERTA UJIAN</Label>
            <div>
              <p>{examEvent.totalParticipants} Orang</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
