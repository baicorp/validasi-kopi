import { redirect } from "next/navigation";
import { validateSessionServer } from "@/actions/validateSession";

export default async function Page() {
  const session = await validateSessionServer();

  const redirectUrl =
    session.user.role === "admin"
      ? "/dashboard/ujian"
      : `/${session.user.username}/ujian`;

  redirect(redirectUrl);
}
