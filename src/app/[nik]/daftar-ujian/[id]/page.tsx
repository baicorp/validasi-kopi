import Link from "next/link";
import { redirect } from "next/navigation";
import { validateSessionServer } from "@/actions/validateSession";
import ExamFormRegistration from "@/components/ui/examEventRegistration";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; nik: string }>;
}) {
  const { nik, id } = await params;
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
    <div className="space-y-6">
      <p>form pendaftaran ujian dengan ID : {id}</p>
      <ExamFormRegistration examEventId={id} />
    </div>
  );
}
