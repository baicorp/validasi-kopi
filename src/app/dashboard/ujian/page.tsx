import { validateSessionServer } from "@/actions/validateSession";
import SearchData from "@/components/ui/searchData";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/user/${session.user.username}`);
  }

  return (
    <section className="py-3 space-y-4">
      <div>
        <p className="text-lg font-semibold">Ujian</p>
      </div>
      <div className="flex justify-between items-center">
        <div className="basis-1/3">
          <SearchData placeholder="Cari nama ujian" />
        </div>
      </div>
    </section>
  );
}
