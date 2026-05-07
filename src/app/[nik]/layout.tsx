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
      <section className="mt-4 px-4 lg:px-10">{children}</section>
    </main>
  );
}

async function Identity() {
  const session = await validateSessionServer();

  if (session.user.role !== "user") {
    redirect("/dashboard/ujian");
  }

  return (
    <div className="flex gap-2 items-center">
      <div className="shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-black text-white">
        <p className="font-medium">{getInitials(session.user.name)}</p>
      </div>
      <div>
        <p className="text-lg font-medium leading-none text-ellipsis line-clamp-1">
          {session.user.name}
        </p>
        <p className="text-muted-foreground text-sm font-mono">
          {session.user.username}
        </p>
      </div>
    </div>
  );
}

function getInitials(name: string, limit: number = 3): string {
  return name
    .trim()
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, limit);
}
