import Link from "next/link";
import { Suspense } from "react";
import { toTitleCase } from "@/lib/utils";
import { redirect } from "next/navigation";
import { SearchParams } from "@/lib/types";
import ErrorComp from "@/components/ui/error";
import Paginator from "@/components/ui/paginator";
import SearchData from "@/components/ui/searchData";
import { deleteGeneratedCode } from "@/actions/codes";
import { formatLocalTime } from "@/lib/datetimeFormat";
import { getAllCodeGroups } from "@/actions/codeGroups";
import DeleteDialog from "@/components/ui/deleteDialog";
import CodeGroupsLabel from "@/components/ui/codeGroupsLabel";
import { validateSessionServer } from "@/actions/validateSession";
import { BrushCleaning, SearchX, Sheet, User } from "lucide-react";
import CodeGroupsSkeleton from "@/components/skeleton/codeGroupsSkeleton";

export default async function Page({ searchParams }: SearchParams) {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/${session.user.username}`);
  }

  const search = (await searchParams).q as string;
  const currentPage = ((await searchParams).page as string) ?? "1";

  return (
    <section className="py-3 space-y-4">
      <div>
        <p className="text-lg font-semibold">Soal yang tersimpan</p>
      </div>
      <div className="flex justify-between items-center">
        <div className="basis-1/3">
          <SearchData placeholder="Cari nama / ujian soal tersimpan" />
        </div>
      </div>
      <Suspense key={search} fallback={<CodeGroupsSkeleton />}>
        <CodeGroups page={currentPage} search={search} />
      </Suspense>
    </section>
  );
}

async function CodeGroups({ page, search }: { page: string; search: string }) {
  const codeGroups = await getAllCodeGroups(Number(page), search);

  if ("error" in codeGroups) {
    return <ErrorComp error={codeGroups.error} />;
  }

  if (codeGroups.data.length === 0) {
    return (
      <div className="h-80 text-muted-foreground flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2">
          {search ? (
            <SearchX className="w-11 h-11" />
          ) : (
            <BrushCleaning className="w-11 h-11" />
          )}
          <span className="block">
            {search ? "Data tidak ditemukan" : "Belum ada soal yang dibuat."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {codeGroups.data.map((codeGroup) => (
          <CodeGroupItem
            key={codeGroup.id}
            id={codeGroup.id}
            groupName={codeGroup.groupName}
            selectedExam={codeGroup.selectedExam}
            totalParticipants={codeGroup.totalParticipants}
            createdAt={codeGroup.createdAt}
          />
        ))}
      </div>
      <div>
        {!("error" in codeGroups) && codeGroups.totalPages > 1 && (
          <Paginator
            currentPage={codeGroups.page}
            totalPages={codeGroups.totalPages}
          />
        )}
      </div>
    </>
  );
}

function CodeGroupItem({
  id,
  groupName,
  selectedExam,
  totalParticipants,
  createdAt,
}: {
  id: string;
  groupName: string;
  selectedExam: string;
  totalParticipants: number;
  createdAt: string | null;
}) {
  return (
    <div
      key={id}
      className="group flex gap-2 justify-between items-center hover:bg-accent rounded-md"
    >
      <Link
        href={`/dashboard/daftar-soal/${id}`}
        className="flex items-center gap-4 px-2.5 p-1.5 w-full"
      >
        <Sheet size={27} />
        <div className="flex flex-col">
          <p>
            {toTitleCase(groupName)}{" "}
            <span className="text-muted-foreground">#{id}</span>
          </p>
          <div className="flex items-center gap-2.5">
            <time
              className="font-mono text-xs text-muted-foreground"
              dateTime={createdAt?.split(" ")[0]}
            >
              {formatLocalTime(createdAt || "")}
            </time>
            <div className="flex items-center gap-1 text-muted-foreground">
              <User size={12} className="mb-1" />
              <span className="text-xs">{totalParticipants}</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex flex-wrap gap-0.5 items-center mx-auto w-76">
          <CodeGroupsLabel label={selectedExam.split(",")} />
        </div>
      </Link>
      <div className="invisible group-hover:visible px-2.5 p-1.5">
        <DeleteDialog
          dialogTitle="Soal"
          deleteFnAction={deleteGeneratedCode}
          id={id.toString()}
          data={groupName}
        />
      </div>
    </div>
  );
}
