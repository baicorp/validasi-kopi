import { redirect } from "next/navigation";
import { validateSessionServer } from "@/actions/validateSession";

export default async function page({
  params,
}: {
  params: Promise<{ examEventId: string }>;
}) {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/${session.user.username}`);
  }

  const { examEventId } = await params;
  return <p>{examEventId}</p>;
}
