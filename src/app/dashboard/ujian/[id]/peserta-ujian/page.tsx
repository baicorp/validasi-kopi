import { Suspense } from "react";
import { redirect } from "next/navigation";
import ErrorComp from "@/components/ui/error";
import Loading from "@/components/skeleton/loading";
import { getExamEventById } from "@/actions/examEvents";
import ExamParticipants from "@/components/ui/examParticipants";
import { validateSessionServer } from "@/actions/validateSession";
import { getAllRegisteredUser } from "@/actions/examRegistrations";

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

  return (
    <div>
      <div className="p-6 border rounded-lg space-y-2">
        <Suspense key={id} fallback={<Loading />}>
          <Participants eventId={Number(id)} />
        </Suspense>
      </div>
    </div>
  );
}

async function Participants({ eventId }: { eventId: number }) {
  const [examEvent, registeredUsers] = await Promise.all([
    getExamEventById(eventId),
    getAllRegisteredUser(eventId),
  ]);

  if ("error" in examEvent) return <ErrorComp error={examEvent.error} />;
  if ("error" in registeredUsers)
    return <ErrorComp error={registeredUsers.error} />;

  return (
    <ExamParticipants
      examEventId={examEvent.id}
      listParticipant={registeredUsers}
      totalParticipants={examEvent.totalParticipants}
    />
  );
}
