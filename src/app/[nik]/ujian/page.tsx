import Link from "next/link";
import { redirect } from "next/navigation";
import EventItem from "@/components/ui/eventItem";
import { getActiveExamEvent } from "@/actions/examEvents";
import { validateSessionServer } from "@/actions/validateSession";

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
    <div className="h-full flex justify-center items-center">
      <ExamEvent />
    </div>
  );
}

async function ExamEvent() {
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
            <Link
              key={event.id}
              href={`ujian/${event.id}`}
              className="w-[270px] block"
            >
              <EventItem key={event.id} {...event} />
            </Link>
          );
        })
      ) : (
        <p>Tidak ada ujian dibuka</p>
      )}
    </div>
  );
}
