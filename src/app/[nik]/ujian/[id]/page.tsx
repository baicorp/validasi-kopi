import { redirect } from "next/navigation";
import ErrorComp from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserNotMatch from "@/components/ui/userNotMatch";
import { getExamEventById } from "@/actions/examEvents";
import { validateSessionServer } from "@/actions/validateSession";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; nik: string }>;
}) {
  const { id, nik } = await params;

  const session = await validateSessionServer();

  if (session.user.role !== "user") {
    redirect("/dashboard/ujian");
  }

  if (session.user.username !== nik) {
    return <UserNotMatch username={session.user.username} />;
  }

  const examEvent = await getExamEventById(Number(id));

  if ("error" in examEvent) {
    return <ErrorComp error={examEvent.error} />;
  }

  return (
    <form className="grid place-items-center">
      <div className="space-y-4 py-4 max-w-3xl">
        {examEvent.selectedExams.split(",").map((examName) => (
          <FormExam key={examName} examName={examName} />
        ))}
        <Button type="submit">Kumpulkan Jawaban</Button>
      </div>
    </form>
  );
}

function FormExam({ examName }: { examName: string }) {
  switch (examName) {
    case "2 out of 5 campuran kopi":
      return <TwoOutOfFive examName={examName} />;
    case "2 out of 5 kopi pure":
      return <TwoOutOfFive examName={examName} />;
    case "treshold single":
      return <TresholdSingleForm />;
    case "treshold mix":
      return <TresholdMixForm />;
    case "identifikasi":
      return <IdentifikasiForm />;
    case "skoring":
      return <SkoringForm />;
    case "triangle":
      return <TriangleForm />;
    default:
      return (
        <div className="bg-red-500 p-4 rounded-lg text-white grid place-items-center">
          <p>Form Tidak Valid untuk {examName}</p>
        </div>
      );
  }
}

function TwoOutOfFive({ examName }: { examName: string }) {
  const values = ["benar", "benar", "salah", "salah", "salah"];
  return (
    <div className="p-2 border rounded-lg space-y-2">
      <p className="font-medium">{examName}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {values.map((value, index) => (
          <div
            key={index}
            className="p-2 border shadow-sm rounded-lg space-y-2"
          >
            <p className="font-medium text-center">{value}</p>
            <Input type="number" placeholder="Kode" />
            <Input type="text" placeholder="Nama sampel" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TresholdSingleForm() {
  const totalInput = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12];
  return (
    <div className="p-2 border rounded-lg space-y-2">
      <p className="font-medium">Treshold single</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {totalInput.map((numb) => (
          <div key={numb} className="p-2 border shadow-sm rounded-lg space-y-2">
            <p className="font-medium text-center">{numb}</p>
            <Input type="number" placeholder="Kode" />
            <Input type="text" placeholder="Rasa" />
            <Input type="number" placeholder="Intensitas" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TresholdMixForm() {
  const totalInput = [1, 2, 3, 4, 5];
  return (
    <div className="p-2 border rounded-lg space-y-2">
      <p className="font-medium">Treshold mix</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {totalInput.map((numb) => (
          <div key={numb} className="p-2 border shadow-sm rounded-lg space-y-2">
            <p className="font-medium text-center">{numb}</p>
            <Input type="number" placeholder="Kode" />
            <Input type="text" placeholder="Rasa 1" />
            <Input type="text" placeholder="Rasa 2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function IdentifikasiForm() {
  const totalInput = [1, 2, 3, 4, 5];
  return (
    <div className="p-2 border rounded-lg space-y-2">
      <p className="font-medium">Identifikasi</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {totalInput.map((numb) => (
          <div key={numb} className="p-2 border shadow-sm rounded-lg space-y-2">
            <p className="font-medium text-center">{numb}</p>
            <Input type="number" placeholder="Kode" />
            <Input type="text" placeholder="Nama produk" />
          </div>
        ))}
      </div>
    </div>
  );
}

function TriangleForm() {
  const values = ["beda", "sama", "sama"];
  return (
    <div className="p-2 border rounded-lg space-y-2">
      <p className="font-medium">Triangle</p>
      <div className="grid grid-cols-3 gap-2">
        {values.map((value, index) => (
          <GenericInput key={index} value={value} />
        ))}
      </div>
    </div>
  );
}

function SkoringForm() {
  const values = ["1.5", "2", "3", "4", "5"];
  return (
    <div className="p-2 border rounded-lg space-y-2">
      <p className="font-medium">Skoring</p>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {values.map((value, index) => (
          <GenericInput key={index} value={value} />
        ))}
      </div>
    </div>
  );
}

function GenericInput({ value }: { value?: string }) {
  return (
    <div className="bg-card text-card-foreground shadow-sm border rounded-lg p-1 flex flex-col justify-between">
      <p className="p-2 font-medium text-center">{value}</p>
      <Input type="number" placeholder="kode" />
    </div>
  );
}
