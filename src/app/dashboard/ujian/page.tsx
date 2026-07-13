import { Suspense } from "react";
import { SearchParams } from "@/lib/types";
import { redirect } from "next/navigation";
import ErrorComp from "@/components/ui/error";
import EventItem from "@/components/ui/eventItem";
import Paginator from "@/components/ui/paginator";
import SearchData from "@/components/ui/searchData";
import { BrushCleaning, SearchX } from "lucide-react";
import { getAllExamEvents } from "@/actions/examEvents";
import AddExamEventBtn from "@/components/ui/addExamEvent";
import { validateSessionServer } from "@/actions/validateSession";
import { ExamEventCardSkeleton } from "@/components/skeleton/examEventCard";

export default async function Page({ searchParams }: SearchParams) {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/${session.user.username}`);
  }
  const { q, page = "1" } = await searchParams;

  return (
    <div className="space-y-4 py-3">
      <section>
        <p className="text-lg font-semibold">Daftar ujian.</p>
      </section>
      <section className="flex justify-between items-center">
        <div className="basis-1/3">
          <SearchData placeholder="Cari nama ujian" />
        </div>
        <AddExamEventBtn />
      </section>
      <Suspense key={(q as string) + page} fallback={<ExamEventCardSkeleton />}>
        <ExamEventList
          currentPage={Number(page)}
          search={q as string}
        />
      </Suspense>
    </div>
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
      <section className="h-80 text-muted-foreground flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2">
          {search ? (
            <SearchX className="w-11 h-11" />
          ) : (
            <BrushCleaning className="w-11 h-11" />
          )}
          <span className="block">
            {search ? "Data tidak ditemukan" : "Belum ada ujian yang dibuat."}
          </span>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(270px,1fr))] xl:grid-cols-4 gap-2.5">
        {examEvents.data.map((event) => (
          <EventItem key={event.id} {...event} />
        ))}
      </section>
      <section>
        {!("error" in examEvents) && examEvents.totalPages > 1 && (
          <Paginator
            currentPage={examEvents.page}
            totalPages={examEvents.totalPages}
          />
        )}
      </section>
    </>
  );
}
