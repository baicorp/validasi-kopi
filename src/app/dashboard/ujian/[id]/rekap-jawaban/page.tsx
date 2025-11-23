import { redirect } from "next/navigation";
import { validateSessionServer } from "@/actions/validateSession";
import { getSubmissionSummary } from "@/actions/examSubmissions";
import ErrorComp from "@/components/ui/error";

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
  const results = await getSubmissionSummary(id);

  if ("error" in results) {
    return <ErrorComp error={results.error} />;
  }

  return (
    <div>
      <p className="text-center font-semibold text-lg">
        Rangkuman Jawaban Ujian
      </p>
      <pre className="text-sm">{JSON.stringify(results, null, 2)}</pre>
    </div>
  );
}
