import Link from "next/link";
import { Suspense } from "react";
import { toTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserNotMatch from "@/components/ui/userNotMatch";
import { getActiveExamEvent } from "@/actions/examEvents";
import { validateSessionServer } from "@/actions/validateSession";
import { formatLocalTime, getDurationString } from "@/lib/datetimeFormat";
import { ExamEventCardSkeleton } from "@/components/skeleton/examEventCard";

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
    return <UserNotMatch username={session.user.username} />;
  }

  return (
    <Suspense fallback={<ExamEventCardSkeleton user />}>
      <ActiveExamEvent nik={session.user.username} />
    </Suspense>
  );
}

async function ActiveExamEvent({ nik }: { nik: string }) {
  const examEvent = await getActiveExamEvent();

  if ("error" in examEvent)
    return (
      <div className="h-full flex justify-center items-center">
        <p className="text-center font-medium font-mono">{examEvent.error}</p>
      </div>
    );

  return (
    <div className="flex flex-col md:flex-row gap-2">
      {examEvent.length !== 0 ? (
        examEvent.map((event) => {
          return (
            <div
              key={event.examEventId}
              className="rounded-lg overflow-hidden border shadow min-w-[270px] md:w-[270px] h-full p-5 flex flex-col justify-between"
            >
              <div className="flex flex-col gap-2">
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
                  <p className="text-muted-foreground mb-1">Daftar ujian</p>
                  <div className="flex items-center flex-wrap gap-2">
                    {event.selectedExam?.split(",").map((exam) => (
                      <Badge key={exam} variant="secondary">
                        {exam}
                      </Badge>
                    ))}
                  </div>
                </div>
                {event.numberAttempt > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-1">Status</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {event.retakeExam ? (
                        <>
                          <span className="text-sm text-red-500">
                            Mengulang ({event.numberAttempt - 1} / 3)
                          </span>
                          <span> : </span>
                          {event.retakeExam.split(",").map((exam) => (
                            <Badge key={exam} variant={"secondary"}>
                              {exam}
                            </Badge>
                          ))}
                        </>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-xs bg-green-500 text-white">
                          SELESAI
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {(event.numberAttempt === 0 ||
                (event.numberAttempt < 4 && event.retakeExam)) && (
                <Link
                  href={`${nik}/ujian/${event.examEventId}`}
                  className="mt-4"
                >
                  <Button className="w-full">
                    Mulai ujian{" "}
                    {event.numberAttempt > 0 && event.retakeExam && "ulang"}
                  </Button>
                </Link>
              )}
            </div>
          );
        })
      ) : (
        <p>Tidak ada ujian dibuka</p>
      )}
    </div>
  );
}
