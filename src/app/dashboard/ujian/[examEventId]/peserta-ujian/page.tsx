import { Suspense } from "react";
import { redirect } from "next/navigation";
import ErrorComp from "@/components/ui/error";
import Loading from "@/components/skeleton/loading";
import ExamParticipants from "@/components/ui/examParticipants";
import { validateSessionServer } from "@/actions/validateSession";
import { getAllRegisteredUser } from "@/actions/examRegistrations";
import ExamDummyAnswerInput from "@/components/ui/examDummyAnswerInput";

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

  return (
    <div className="flex flex-col gap-4">
      <section className="px-6 py-4 border rounded-lg space-y-6">
        <DummyExamValues examEventId={examEventId} />
      </section>
      <section className="px-6 py-4 border rounded-lg space-y-6">
        <Suspense fallback={<Loading />}>
          <Participants examEventId={examEventId} />
        </Suspense>
      </section>
    </div>
  );
}

async function Participants({ examEventId }: { examEventId: string }) {
  const registeredUsers = await getAllRegisteredUser(examEventId);

  if ("error" in registeredUsers)
    return <ErrorComp error={registeredUsers.error} />;

  return <ExamParticipants listParticipant={registeredUsers} />;
}

async function DummyExamValues({ examEventId }: { examEventId: string }) {
  return <ExamDummyAnswerInput examEventId={examEventId} />;
}
