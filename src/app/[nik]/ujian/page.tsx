import Link from "next/link";
import { Suspense } from "react";
import { toTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/skeleton/loading";
import { getActiveExamEvent } from "@/actions/examEvents";
import { validateSessionServer } from "@/actions/validateSession";
import { formatLocalTime, getDurationString } from "@/lib/datetimeFormat";

export default async function Page({
  params,
}: {
  params: Promise<{ nik: string }>;
}) {
  const { nik } = await params;
  const session = await validateSessionServer();

  if (session.user.role !== "user") {
    redirect("/dashboard/ujian");
  }

  if (session.user.username !== nik) {
    return (
      <div className="h-full flex flex-col gap-4 justify-center items-center">
        <h1 className="text-2xl font-bold">404</h1>
        <p>
          Anda masuk denga NIK{" "}
          <span className="font-bold">{session.user.username}</span>
        </p>
        <Link href={`/${session.user.username}/ujian`}>Kembali</Link>
      </div>
    );
  }

  return (
    <div>
      <Suspense fallback={<Loading />}>
        <ActiveExamEvent />
      </Suspense>
    </div>
  );
}

async function ActiveExamEvent() {
  const examEvent = await getActiveExamEvent();

  if ("error" in examEvent)
    return (
      <div className="h-full flex justify-center items-center">
        <p className="text-center font-medium font-mono">{examEvent.error}</p>
      </div>
    );

  return (
    <div>
      {examEvent.length !== 0 ? (
        examEvent.map((event) => {
          return (
            <div
              key={event.examEventId}
              className="rounded-lg overflow-hidden border shadow w-[270px]"
            >
              <div className="p-5 flex flex-col gap-2">
                <p className="font-medium">
                  {toTitleCase(event.examEventName)}
                </p>
                <div>
                  <p className="text-muted-foreground mb-1">Pelaksanaan</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <p className="text-sm">
                      {formatLocalTime(event.examStart)}
                    </p>
                    <span>→</span>
                    <p className="text-sm">{formatLocalTime(event.examEnd)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Waktu pengerjaan</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <p className="text-sm">
                      {getDurationString(event.examStart, event.examEnd)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">
                    Ujian yang dipilih
                  </p>
                  <div className="flex items-center flex-wrap gap-2">
                    {event.selectedExam?.split(",").map((exam) => (
                      <Badge key={exam} variant="secondary">
                        {exam}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Link href={`ujian/${event.examEventId}`} className="mt-4">
                  <Button className="w-full">Mulai ujian</Button>
                </Link>
              </div>
            </div>
          );
        })
      ) : (
        <p>Tidak ada ujian dibuka</p>
      )}
    </div>
  );
}
