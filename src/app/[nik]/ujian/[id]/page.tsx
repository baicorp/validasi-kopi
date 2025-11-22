import {
  getExamEventById,
  getExamInputFormBasedOnSelectedExamForm,
} from "@/actions/examEvents";
import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import ErrorComp from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import Loading from "@/components/skeleton/loading";
import SelectTaste from "@/components/ui/selectTaste";
import { formatLocalTime } from "@/lib/datetimeFormat";
import UserNotMatch from "@/components/ui/userNotMatch";
import SubmitExamForm from "@/components/form/submitExamForm";
import SelectIntensity from "@/components/ui/selectIntensity";
import SelectTasteInten from "@/components/ui/selectTasteInten";
import SelectProductName from "@/components/ui/selectProductName";
import { validateSessionServer } from "@/actions/validateSession";
import { getUserLatestExamAttemptNumber } from "@/actions/examSubmissions";

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

  const examEvent = await getExamInputFormBasedOnSelectedExamForm(id);

  if ("error" in examEvent) {
    return <ErrorComp error={examEvent.error} />;
  }

  return (
    <div className="flex justify-center">
      <div className="max-w-3xl space-y-4">
        <Suspense key={id} fallback={<Loading />}>
          <ExamFormInfo examEventId={id} />
        </Suspense>
        <SubmitExamForm>
          {examEvent.selectedExams.split(",").map((examName) => (
            <InputForm key={examName} examEventId={id} examName={examName} />
          ))}
        </SubmitExamForm>
      </div>
    </div>
  );
}

async function ExamFormInfo({ examEventId }: { examEventId: string }) {
  const result = await getExamEventById(Number(examEventId));

  if ("error" in result) {
    return <ErrorComp error={result.error} />;
  }

  return (
    <div className="grid grid-cols-[auto_auto_1fr] gap-x-3">
      <p>Nama ujian</p>
      <span> : </span>
      <p>{result.examEventName}</p>
      <p>Kesempatan</p>
      <span> : </span>
      <Suspense fallback={<span>...</span>}>
        <CurrentAttempt examEventId={examEventId} variant="next" />
      </Suspense>
      <p>Mulai</p>
      <span> : </span>
      <div className="flex gap-2 items-center">
        <Calendar className="w-4 h-4" />
        <p>{formatLocalTime(result.examStart)}</p>
      </div>
      <p>Selesai</p>
      <span> : </span>
      <div className="flex gap-2 items-center">
        <Calendar className="w-4 h-4" />
        <p>{formatLocalTime(result.examEnd)}</p>
      </div>
    </div>
  );
}

async function CurrentAttempt({
  examEventId,
  variant = "default",
}: {
  examEventId: string;
  variant?: "default" | "next";
}) {
  const result = await getUserLatestExamAttemptNumber(Number(examEventId));

  if ("error" in result) {
    return <ErrorComp error={result.error} />;
  }
  return (
    <span>
      {variant === "next" ? result.latestAttempt + 1 : result.latestAttempt} / 4
    </span>
  );
}

function InputForm({
  examEventId,
  examName,
}: {
  examEventId: string;
  examName: string;
}) {
  switch (examName) {
    case "2 out of 5 campuran kopi":
      return <TwoOutOfFive examEventId={examEventId} examName={examName} />;
    case "2 out of 5 kopi pure":
      return <TwoOutOfFive examEventId={examEventId} examName={examName} />;
    case "treshold single":
      return <TresholdSingleForm />;
    case "treshold mix":
      return <TresholdMixForm />;
    case "identifikasi":
      return <IdentifikasiForm examEventId={examEventId} />;
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

function TwoOutOfFive({
  examEventId,
  examName,
}: {
  examEventId: string;
  examName: string;
}) {
  const values = ["beda", "beda", "beda", "sama", "sama"];
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
            <Input
              type="number"
              name={`${examName}-${value}-${index}-code`}
              placeholder="Kode"
            />
            <SelectProductName
              inputName={`${examName}-${value}-${index}-addValue`}
              examEventId={examEventId}
              examName={examName}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TresholdSingleForm() {
  const totalInput = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  return (
    <div className="p-2 border rounded-lg space-y-2">
      <p className="font-medium">Treshold single</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {totalInput.map((numb) => (
          <div key={numb} className="p-2 border shadow-sm rounded-lg space-y-2">
            <p className="font-medium text-center text-muted-foreground">
              #{numb}
            </p>
            <Input
              type="number"
              name={`treshold single-${numb}-code`}
              placeholder="Kode"
            />
            <SelectTaste inputName={`treshold single-${numb}-value`} />
            <SelectIntensity inputName={`treshold single-${numb}-addValue`} />
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {totalInput.map((numb) => (
          <div key={numb} className="p-2 border shadow-sm rounded-lg space-y-2">
            <p className="font-medium text-center text-muted-foreground">
              #{numb}
            </p>
            <Input
              type="number"
              placeholder="Kode"
              name={`treshold mix-${numb}-code`}
            />
            <SelectTasteInten inputName={`treshold mix-${numb}-value`} />
            <SelectTasteInten inputName={`treshold mix-${numb}-addValue`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function IdentifikasiForm({ examEventId }: { examEventId: string }) {
  const totalInput = [1, 2, 3, 4, 5];
  return (
    <div className="p-2 border rounded-lg space-y-2">
      <p className="font-medium">Identifikasi</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {totalInput.map((numb) => (
          <div key={numb} className="p-2 border shadow-sm rounded-lg space-y-2">
            <p className="font-medium text-center text-muted-foreground">
              #{numb}
            </p>
            <Input
              type="number"
              name={`identifikasi-${numb}-code`}
              placeholder="Kode"
            />
            <SelectProductName
              inputName={`identifikasi-${numb}-value`}
              examEventId={examEventId}
              examName="identifikasi"
            />
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
          <GenericInput key={index} examName="triangle" value={value} />
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
          <GenericInput key={index} examName="skoring" value={value} />
        ))}
      </div>
    </div>
  );
}

function GenericInput({
  examName,
  value,
}: {
  examName: string;
  value?: string;
}) {
  return (
    <div className="bg-card text-card-foreground shadow-sm border rounded-lg p-1 flex flex-col justify-between">
      <p className="p-2 font-medium text-center">{value}</p>
      <Input type="number" name={`${examName}-${value}`} placeholder="kode" />
    </div>
  );
}
