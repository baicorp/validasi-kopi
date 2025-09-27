import { Suspense } from "react";
import { getTableData } from "@/actions/kode";
import { transformDataFromDB } from "@/lib/utils";
import DataViewer from "@/components/ui/dataViewer";
import { Separator } from "@/components/ui/separator";
import FormChecker from "@/components/ui/formChecker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle } from "lucide-react";

interface TableViewerPagProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: TableViewerPagProps) {
  const { id } = await params;
  return (
    <section>
      <p className="mb-6">
        Soal kode <span className="font-mono">{id}</span>
      </p>
      <Suspense
        fallback={
          <div className="flex gap-2">
            <span>Loading</span>
            <LoaderCircle className="animate-spin mr-2" />
          </div>
        }
      >
        <Data id={id} />
      </Suspense>
    </section>
  );
}

async function Data({ id }: { id: string }) {
  const data = await getTableData(id);
  const formatedData = transformDataFromDB(data);

  return (
    <div>
      <Tabs defaultValue="tampilkan-tabel">
        <TabsList>
          <TabsTrigger value="tampilkan-tabel">Tampilkan Tabel</TabsTrigger>
          <TabsTrigger value="form-checker">Cek Jawaban</TabsTrigger>
        </TabsList>
        <TabsContent value="tampilkan-tabel">
          <DataViewer
            jenisUji={data[0].jenisUjian}
            generatedCodeData={formatedData}
          />
        </TabsContent>
        <TabsContent value="form-checker">
          <Separator className="my-6" />
          <FormChecker dataSoal={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
