import Link from "next/link";
import { Suspense } from "react";
import { toTitleCase } from "@/lib/utils";
import DeleteDialog from "@/components/ui/deleteDialog";
import { deleteSoalUji, getListSoal } from "@/actions/kode";
import { BrushCleaning, FileSpreadsheet } from "lucide-react";

export default function Page() {
  return (
    <>
      <section>
        <p className="text-lg font-semibold mb-4">Soal yang tersimpan</p>
        <Suspense fallback={<ListSoalSkeleton />}>
          <ListSoal />
        </Suspense>
      </section>
    </>
  );
}

async function ListSoal() {
  const list = await getListSoal();

  if (list.length === 0) {
    return (
      <div className="h-80 text-muted-foreground flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2">
          <BrushCleaning className="w-11 h-11" />
          <span className="block">Belum ada soal tersimpan.</span>
        </div>
      </div>
    );
  }

  return list.map((data) => (
    <div
      key={data.session_uuid}
      className="group flex gap-2 justify-between items-center hover:bg-accent rounded-md"
    >
      <Link
        href={`/dashboard/list-soal/${data.session_uuid}`}
        className="flex items-center gap-2 px-2.5 p-1.5 w-full"
      >
        <FileSpreadsheet size={20} />
        <span className="font-mono">{toTitleCase(data?.session_name)}</span>
      </Link>
      <div className="hidden group-hover:block px-2.5 p-1.5">
        <DeleteDialog
          dialogTitle="Soal"
          deleteFnAction={deleteSoalUji}
          idProduk={data.session_uuid}
          namaProduk={data.session_name}
        />
      </div>
    </div>
  ));
}

function ListSoalSkeleton() {
  return [1, 2, 3, 4].map((data) => (
    <div key={data} className="flex gap-2.5 mb-1.5">
      <div className="w-8 h-7 rounded-md animate-pulse bg-accent" />
      <div className="w-56 h-7 rounded-md animate-pulse bg-accent" />
    </div>
  ));
}
