import { redirect } from "next/navigation";
import { validateSessionServer } from "@/actions/validateSession";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/user/${session.user.username}`);
  }

  const { id } = await params;
  return <p>{id}</p>;
}
