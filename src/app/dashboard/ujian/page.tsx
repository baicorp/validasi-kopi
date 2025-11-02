import Link from "next/link";
import { Suspense } from "react";
import { toTitleCase } from "@/lib/utils";
import { SearchParams } from "@/lib/types";
import { redirect } from "next/navigation";
import ErrorComp from "@/components/ui/error";
import { InferSelectModel } from "drizzle-orm";
import Paginator from "@/components/ui/paginator";
import { examEvents } from "@/db/schema/examEvents";
import SearchData from "@/components/ui/searchData";
import { Separator } from "@/components/ui/separator";
import { getAllExamEvents } from "@/actions/examEvents";
import AddExamEventBtn from "@/components/ui/addExamEvent";
import { BrushCleaning, Calendar, Clock } from "lucide-react";
import { validateSessionServer } from "@/actions/validateSession";

export default async function Page({ searchParams }: SearchParams) {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/user/${session.user.username}`);
  }

  const currentPage = ((await searchParams).page as string) ?? "1";
  const search = (await searchParams).q as string;

  return (
    <section className="py-3 space-y-4">
      <div>
        <p className="text-lg font-semibold">Ujian</p>
      </div>
      <div className="flex justify-between items-center">
        <div className="basis-1/3">
          <SearchData placeholder="Cari nama ujian" />
        </div>
        <AddExamEventBtn />
      </div>
      <Suspense
        key={search + currentPage}
        fallback={<p>Loading daftar pelaksanaan ujian. . .</p>}
      >
        <ExamEventList currentPage={Number(currentPage)} search={search} />
      </Suspense>
    </section>
  );
}

async function ExamEventList({
  currentPage,
  search,
}: {
  currentPage: number;
  search: string | undefined;
}) {
  const examEvents = await getAllExamEvents(currentPage, search);

  if ("error" in examEvents) {
    return <ErrorComp error={examEvents.error} />;
  }

  if (examEvents.data.length === 0) {
    return (
      <div className="h-80 text-muted-foreground flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2">
          <BrushCleaning className="w-11 h-11" />
          <span className="block">Belum ada soal tersimpan.</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-4 gap-2.5">
        {examEvents.data.map((event) => (
          <Link key={event.id} href={`ujian/${event.id}`}>
            <EventItem key={event.id} {...event} />
          </Link>
        ))}
      </div>
      <div>
        {!("error" in examEvents) && examEvents.totalPages > 1 && (
          <Paginator
            currentPage={examEvents.page}
            totalPages={examEvents.totalPages}
          />
        )}
      </div>
    </>
  );
}

function EventItem({
  examEventName,
  registrationStart,
  registrationEnd,
  examStart,
  examEnd,
  updatedAt,
}: InferSelectModel<typeof examEvents>) {
  return (
    <div className="rounded-lg overflow-hidden border shadow w-fit">
      <div className="p-5 flex flex-col gap-4">
        <p className="text-lg font-medium">{toTitleCase(examEventName)}</p>
        <div>
          <p className="text-muted-foreground mb-1.5">Registrasi</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <p className="text-sm">{registrationStart}</p>
            <span>→</span>
            <p className="text-sm">{registrationEnd}</p>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-1.5">Pelaksanaan</p>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <p className="text-sm">{examStart}</p>
            <span>→</span>
            <p className="text-sm">{examEnd}</p>
          </div>
        </div>
      </div>
      <Separator />
      <div className="p-4 bg-muted">
        <p className="text-xs text-muted-foreground">
          Diperbarui : {new Date(updatedAt + "Z").toLocaleString()}
        </p>
      </div>
    </div>
  );
}
