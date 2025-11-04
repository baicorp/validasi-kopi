import Link from "next/link";
import { redirect } from "next/navigation";
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
      <div className="h-dvh flex flex-col gap-4 justify-center items-center">
        <h1 className="text-2xl font-bold">404</h1>
        <p>Anda masuk denga NIK {nik}</p>
        <Link href={`/${session.user.username}`}>Kembali</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 justify-center items-center">
      <p className="text-center font-medium font-mono">
        Tidak Ada Ujian Yang Dijadwalkan.
      </p>
    </div>
  );
}
