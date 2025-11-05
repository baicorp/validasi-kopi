import Link from "next/link";
import { Suspense } from "react";
import { toTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Loading from "@/components/skeleton/loading";
import { formatLocalTime } from "@/lib/datetimeFormat";
import { validateSessionServer } from "@/actions/validateSession";
import { getActiveRegistrationExamEvent } from "@/actions/examEvents";

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
      <div className="flex flex-col gap-4 justify-center items-center">
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
        <RegistrationExamEvent />
      </Suspense>
    </div>
  );
}

async function RegistrationExamEvent() {
  const examEventRegistration = await getActiveRegistrationExamEvent();

  if ("error" in examEventRegistration)
    return (
      <div className="h-full flex justify-center items-center">
        <p className="text-center font-medium font-mono">
          {examEventRegistration.error}
        </p>
      </div>
    );

  return (
    <div className="flex gap-2 flex-wrap">
      {examEventRegistration.length !== 0 ? (
        examEventRegistration.map((event) => {
          return (
            <div
              className="w-[280px] rounded-lg overflow-hidden border shadow"
              key={event.examEventId}
            >
              <div className="p-3 flex flex-col gap-2">
                <p className="font-medium">
                  {toTitleCase(event.examEventName)}
                </p>
                <div>
                  <p className="text-muted-foreground mb-1">Registrasi</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <p className="text-sm">
                      {formatLocalTime(event.registrationStart)}
                    </p>
                    <span>→</span>
                    <p className="text-sm">
                      {formatLocalTime(event.registrationEnd)}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Pelaksanaan</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <p className="text-sm">
                      {formatLocalTime(event.examStart)}
                    </p>
                    <span>→</span>
                    <p className="text-sm">{formatLocalTime(event.examEnd)}</p>
                  </div>
                </div>
                {event.isRegistered ? (
                  <>
                    <div>
                      <p className="text-muted-foreground mb-1">Status</p>
                      <Badge className="bg-green-500">Sudah terdaftar</Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">
                        Ujian yang dipilih
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {event.selectedExam?.split(",").map((exam) => (
                          <Badge variant={"secondary"} key={exam}>
                            {exam}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link href={`daftar-ujian/${event.examEventId}`}>
                    <Button className="w-full">Daftar</Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p>Tidak Ada Pendaftaran Ujian yang dibuka.</p>
      )}
    </div>
  );
}
