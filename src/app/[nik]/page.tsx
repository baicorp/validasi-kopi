import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UserNotMatch from "@/components/ui/userNotMatch";
import { getActiveExamEvent } from "@/actions/examEvents";
import { validateSessionServer } from "@/actions/validateSession";
import { CardSectionTitle } from "@/components/ui/cardSectionTitle";
import { CardExamDateTime } from "@/components/ui/cardExamDateTime";
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
            <UserExamEventItem
              key={event.examEventId}
              nik={nik}
              numberAttempt={event.numberAttempt}
              retakeExam={event.retakeExam}
              examEventId={event.examEventId}
              examEventName={event.examEventName}
              examStart={event.examStart}
              examEnd={event.examEnd}
              selectedExam={event.selectedExam}
            />
          );
        })
      ) : (
        <ExamNotFound />
      )}
    </div>
  );
}

type GetActiveExamEventResult = Awaited<ReturnType<typeof getActiveExamEvent>>;

type UserExamEventItem = Exclude<
  GetActiveExamEventResult,
  { error: string }
>[number];

function UserExamEventItem({
  nik,
  numberAttempt,
  retakeExam,
  examEventId,
  examEventName,
  examStart,
  examEnd,
  selectedExam,
}: UserExamEventItem & { nik: string }) {
  const nowUtc = new Date(new Date().toUTCString()).getTime();
  const examEndUtc = new Date(examEnd).getTime();

  const timeDiff = (examEndUtc - nowUtc) / 1000;

  const minutes = Math.floor((timeDiff / 60) % 60);
  const hours = Math.floor((timeDiff / 3600) % 24);
  const days = Math.floor(timeDiff / 86400);

  return (
    <div
      key={examEventId}
      className="rounded-lg overflow-hidden border shadow min-w-[270px] md:w-[270px] h-full py-3 flex flex-col gap-2 justify-between"
    >
      <div className="border-b">
        <p className="font-medium px-5 pb-2">{examEventName}</p>
      </div>
      <div className="flex flex-col gap-2 px-5">
        <div>
          <CardSectionTitle>PELAKSANAAN UJIAN</CardSectionTitle>
          <div className="flex gap-2">
            <CardExamDateTime examDateTime={examStart} variant="start" />
            <ArrowRightIcon size="18" className="self-center" />
            <CardExamDateTime examDateTime={examEnd} variant="end" />
          </div>
        </div>
        <Separator />
        <div>
          <CardSectionTitle>BERAKHIR DALAM</CardSectionTitle>
          <div className="flex gap-2">
            <p className="text-lg font-bold">{days}</p>
            <span className="text-xs self-end">Hari</span>
            <p className="text-lg font-bold">{hours}</p>
            <span className="text-xs self-end">Jam</span>
            <p className="text-lg font-bold">{minutes}</p>
            <span className="text-xs self-end">Menit</span>
          </div>
        </div>
        <Separator />
        <div>
          <CardSectionTitle>DAFTAR UJIAN</CardSectionTitle>
          <div className="flex items-center flex-wrap gap-2">
            {selectedExam?.split(",").map((exam) => (
              <Badge key={exam} variant="secondary">
                {exam}
              </Badge>
            ))}
          </div>
        </div>
        {numberAttempt > 0 && (
          <div className="border-t pt-2">
            <div className="flex justify-between">
              <CardSectionTitle>STATUS</CardSectionTitle>
              {retakeExam ? (
                <span className="text-xs font-font-medium text-destructive">
                  MENGULANG ({numberAttempt - 1} / 3)
                </span>
              ) : (
                <span className="px-2 flex justify-center items-center rounded-md text-xs bg-green-500 text-white">
                  SELESAI
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {retakeExam && (
                <>
                  {retakeExam.split(",").map((exam) => (
                    <Badge key={exam} variant="destructive">
                      {exam}
                    </Badge>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {(numberAttempt === 0 || (numberAttempt < 4 && retakeExam)) && (
        <div className="px-5 pt-1">
          <Link href={`${nik}/ujian/${examEventId}`}>
            <Button className="w-full">
              Mulai ujian {numberAttempt > 0 && retakeExam && "ulang"}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

function ExamNotFound() {
  return (
    <div className="mt-8 w-full">
      <p className="font-semibold text-center">Tidak ada ujian yang tersedia</p>
      <p className="text-muted-foreground text-center text-sm">
        Saat ini belum ada ujian yang dibuka untukmu. Ujian akan muncul di sini
        saat periode pelaksanaan dimulai.
      </p>
    </div>
  );
}
