import { redirect } from "next/navigation";
import { validateSessionServer } from "@/actions/validateSession";
import { getUserRegisteredExamEvents } from "@/actions/examRegistrations";
import ErrorComp from "@/components/ui/error";
import Loading from "@/components/skeleton/loading";
import { Suspense } from "react";
import { BrushCleaning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CodeGroupExamForm from "@/components/ui/addCodeGroupExam";

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
      <Suspense fallback={<Loading />}>
        <ExamParticipantList examEventId={id} />
      </Suspense>
    </div>
  );
}

async function ExamParticipantList({ examEventId }: { examEventId: string }) {
  const participants = await getUserRegisteredExamEvents(Number(examEventId));

  if ("error" in participants) {
    return <ErrorComp error={participants.error} />;
  }

  if (participants.length === 0) {
    return (
      <div className="h-80 text-muted-foreground flex justify-center items-center">
        <div className="flex flex-col justify-center items-center gap-2">
          <BrushCleaning className="w-11 h-11" />
          <span className="block">Belum ada peserta yang mendaftar.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {participants.map((data) => (
        <div key={data.examGroup} className="space-y-4 border rounded-lg p-4">
          <CodeGroupExamForm
            codeGroupId={data.codeGroupId}
            selectedExam={data.examGroup}
            participants={data.data}
          />
          <div>
            <p className="font-medium mb-1">Ujian yang dipilih</p>
            <div className="flex flex-wrap gap-2">
              {data.examGroup.split(",").map((exam) => (
                <Badge key={exam} variant="secondary">
                  {exam}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <p className="font-medium mb-1">
              Daftar Peserta Ujian ({data.data.length} orang)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {data.data.map((participant) => (
                <ExamParticipantItem
                  key={participant.username}
                  username={participant.username}
                  name={participant.name}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExamParticipantItem({
  username,
  name,
}: {
  username: string;
  name: string;
}) {
  return (
    <div className="flex flex-col p-2.5 rounded-md border shadow">
      <p className="font-medium">{name}</p>
      <p className="text-sm text-muted-foreground">
        NIK : <span>{username}</span>
      </p>
    </div>
  );
}
