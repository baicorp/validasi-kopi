import { redirect } from "next/navigation";
import SignOutButton from "@/components/ui/signOutBtn";
import { validateSessionServer } from "@/actions/validateSession";

export default async function Page({
  params,
}: {
  params: Promise<{ nik: string }>;
}) {
  const { nik } = await params;
  const session = await validateSessionServer();

  if (session.user.role !== "user") {
    redirect("/dashboard/produk");
  }

  return (
    <div className="h-dvh flex flex-col gap-4 justify-center items-center">
      <p className="text-lg font-semibold font-mono">Wellcome back, {nik}</p>
      <div className="w-fit">
        <SignOutButton />
      </div>
    </div>
  );
}
