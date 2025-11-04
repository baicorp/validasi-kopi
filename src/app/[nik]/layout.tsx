import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import Loading from "../dashboard/loading";
import SignOutButton from "@/components/ui/signOutBtn";
import { validateSessionServer } from "@/actions/validateSession";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="py-4">
      <section className="px-4 lg:px-10 flex justify-between items-center">
        <Suspense fallback={<Loading />}>
          <Identity />
        </Suspense>
        <div className="flex gap-3">
          <SignOutButton />
        </div>
      </section>
      <section className="px-4 lg:px-10 flex justify-between">
        <Link className="py-4 text-center basis-1/2" href={"ujian"}>
          Ujian
        </Link>
        <Link className="py-4 text-center basis-1/2" href="daftar-ujian">
          Daftar Ujian
        </Link>
      </section>
      <section className="pt-4 px-4 lg:px-10 h-[calc(100dvh_-_136px)]">
        {children}
      </section>
    </main>
  );
}

async function Identity() {
  const session = await validateSessionServer();

  if (session.user.role !== "user") {
    redirect("/dashboard/ujian");
  }

  return (
    <div>
      <p className="text-lg font-medium">{session.user.name}</p>
      <p className="text-muted-foreground text-sm">{session.user.username}</p>
    </div>
  );
}
