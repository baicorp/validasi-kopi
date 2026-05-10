import { redirect } from "next/navigation";
import UserAnswerList from "@/components/ui/userAnswerListItem";
import { validateSessionServer } from "@/actions/validateSession";

export default async function page() {
  const session = await validateSessionServer();
  if (session.user.role !== "admin") {
    redirect(`/${session.user.username}`);
  }

  return (
    <div>
      <p className="text-center font-semibold text-lg">Rekap Jawaban Ujian</p>
      <UserAnswerList />
    </div>
  );
}
