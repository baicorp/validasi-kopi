import { Suspense } from "react";
import ErrorComp from "@/components/ui/error";
import { getTableData } from "@/actions/codes";
import Loading from "@/components/skeleton/loading";
import ExamDetails from "@/components/ui/examDetail";
import { Separator } from "@/components/ui/separator";
import ExamsTable from "@/components/table/examsTable";
import FormChecker from "@/components/form/formChecker";
import { validateSessionServer } from "@/actions/validateSession";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await validateSessionServer();

  const { id } = await params;

  return (
    <>
      <section className="pt-3">
        <p>
          Soal kode <span className="font-mono">{id}</span>
        </p>
      </section>
      <Suspense fallback={<Loading />}>
        <TabsContentData id={id} />
      </Suspense>
    </>
  );
}

async function TabsContentData({ id }: { id: string }) {
  const examDataDetails = await getTableData(id);

  if ("error" in examDataDetails) {
    return <ErrorComp error={examDataDetails.error} />;
  }

  return (
    <>
      <ExamDetails examDataDetails={examDataDetails} />
      <Tabs defaultValue="tampilkan-tabel">
        <TabsList>
          <TabsTrigger value="tampilkan-tabel">Tampilkan Tabel</TabsTrigger>
          <TabsTrigger value="form-checker">Cek Jawaban</TabsTrigger>
        </TabsList>
        <Separator className="my-3" />
        <TabsContent value="tampilkan-tabel">
          <ExamsTable formatedExamsData={examDataDetails.formatedExamsData} />
        </TabsContent>
        <TabsContent value="form-checker">
          <FormChecker
            rawExamsData={examDataDetails.rowExamsData}
            formatedExamsData={examDataDetails.formatedExamsData}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
