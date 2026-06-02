import {
  getExamEventById,
  getExamInputFormBasedOnSelectedExamForm,
} from "@/actions/examEvents";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import ErrorComp from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Callout from "@/components/ui/callout";
import { Textarea } from "@/components/ui/textarea";
import Loading from "@/components/skeleton/loading";
import SelectTaste from "@/components/ui/selectTaste";
import { Separator } from "@/components/ui/separator";
import UserNotMatch from "@/components/ui/userNotMatch";
import SubmitExamForm from "@/components/form/submitExamForm";
import SelectIntensity from "@/components/ui/selectIntensity";
import SelectTasteInten from "@/components/ui/selectTasteInten";
import ExamEventPeriode from "@/components/ui/examEventPeriode";
import SelectProductName from "@/components/ui/selectProductName";
import { validateSessionServer } from "@/actions/validateSession";
import { CardSectionTitle } from "@/components/ui/cardSectionTitle";
import { getUserLatestExamAttemptNumber } from "@/actions/examSubmissions";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; nik: string }>;
}) {
  const session = await validateSessionServer();
  if (session.user.role !== "user") {
    redirect("/dashboard/ujian");
  }

  const { id, nik } = await params;
  if (session.user.username !== nik) {
    return <UserNotMatch username={session.user.username} />;
  }

  const examEvent = await getExamInputFormBasedOnSelectedExamForm(id);

  if ("error" in examEvent) {
    return <ErrorComp error={examEvent.error} />;
  }

  return (
    <div>
      <div className="mx-auto max-w-3xl">
        <Suspense key={id} fallback={<Loading />}>
          <ExamFormInfo examEventId={id} />
        </Suspense>
        <SubmitExamForm>
          {examEvent.selectedExams.split(",").map((examName, index) => (
            <InputForm
              key={examName}
              index={index}
              examEventId={id}
              examName={examName}
            />
          ))}
        </SubmitExamForm>
      </div>
    </div>
  );
}

async function ExamFormInfo({ examEventId }: { examEventId: string }) {
  const result = await getExamEventById(examEventId);

  if ("error" in result) {
    return <ErrorComp error={result.error} />;
  }

  const nowUtc = new Date(new Date().toUTCString()).getTime();
  const examEndUtc = new Date(result.examEnd).getTime();

  const timeDiff = (examEndUtc - nowUtc) / 1000;

  const minutes = Math.floor((timeDiff / 60) % 60);
  const hours = Math.floor((timeDiff / 3600) % 24);
  const days = Math.floor(timeDiff / 86400);

  return (
    <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mb-4 border-b pb-2">
      <div className="flex flex-col gap-2">
        <div className="w-fit">
          <ExamEventPeriode
            className="flex gap-1 items-center"
            variant={"berlangsung"}
          >
            <Suspense fallback={<span className="text-xs"> • </span>}>
              <AttemptDescription examEventId={examEventId} />
            </Suspense>
          </ExamEventPeriode>
        </div>
        <p className="font-semibold text-lg leading-tight">
          {result.examEventName}
        </p>
      </div>
      <Separator className="md:hidden" />
      <div className="pt-1 md:pt-0">
        <CardSectionTitle>SISA WAKTU</CardSectionTitle>
        <div className="flex gap-2">
          <div className="flex gap-1">
            <p className="text-2xl font-bold font-mono">{days}</p>
            <span className="text-xs self-end mb-1">Hari</span>
          </div>
          <div className="flex gap-1">
            <p className="text-2xl font-bold font-mono">{hours}</p>
            <span className="text-xs self-end mb-1">Jam</span>
          </div>
          <div className="flex gap-1">
            <p className="text-2xl font-bold font-mono">{minutes}</p>
            <span className="text-xs self-end mb-1">Menit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

async function AttemptDescription({ examEventId }: { examEventId: string }) {
  const result = await getUserLatestExamAttemptNumber(examEventId);

  if ("error" in result) {
    return <ErrorComp error={result.error} />;
  }
  const currentAttempt = result.latestAttempt + 1;

  return currentAttempt === 1 ? (
    <span className="text-xs font-medium">• Ujian Reguler</span>
  ) : (
    <span className="text-xs font-medium">
      • Mengulang <span>{currentAttempt - 1} dari 3</span>
    </span>
  );
}

function InputForm({
  examEventId,
  examName,
  index,
}: {
  examEventId: string;
  examName: string;
  index: number;
}) {
  const rowNumber = index + 1;
  switch (examName) {
    case "2 out of 5 pure":
    case "2 out of 5 creamer":
    case "2 out of 5 coklat":
      return (
        <TwoOutOfFive
          index={rowNumber}
          examEventId={examEventId}
          examName={examName}
        />
      );
    case "treshold single":
      return <TresholdSingleForm index={rowNumber} />;
    case "treshold mix":
      return <TresholdMixForm index={rowNumber} />;
    case "identifikasi":
      return <IdentifikasiForm index={rowNumber} examEventId={examEventId} />;
    case "skoring":
      return <SkoringForm index={rowNumber} />;
    case "triangle":
      return <TriangleForm index={rowNumber} />;
    default:
      return null;
  }
}

function TwoOutOfFive({
  examEventId,
  examName,
  index,
}: {
  examEventId: string;
  examName: string;
  index: number;
}) {
  const values = ["beda", "beda", "beda", "sama", "sama"];
  return (
    <div className="border rounded-lg space-y-2">
      <InputFormHeader
        sequenceNumber={index}
        numberOfSamples={5}
        examName={examName}
      />
      <div className="p-2">
        <Callout>
          <p>
            Di hadapan Anda terdapat 5 sampel,{" "}
            <span className="font-bold">2 sampel yang sama</span> dan{" "}
            <span className="font-bold">3 sampel berbeda</span>. Cicipi sampel
            secara berurutan. Identifikasikan{" "}
            <span className="font-bold">sampel mana yang sama.</span>
          </p>
        </Callout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
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
                required
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
    </div>
  );
}

function TresholdSingleForm({ index }: { index: number }) {
  const totalInput = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  return (
    <div className="border rounded-lg space-y-2">
      <InputFormHeader
        sequenceNumber={index}
        numberOfSamples={12}
        examName="Treshold single"
      />
      <div className="p-2">
        <Callout>
          <p>
            Di hadapan Anda terdapat 12 sampel. Cicipi secara berurutan.
            Identifikasi sampel mana yang terdeteksi rasa
            <span className="font-bold">
              {" "}
              asin, manis, pahit, asam, dan tidak berasa
            </span>{" "}
            dengan memilih rasa pada pilihan di bawah ini.{" "}
            <span className="font-bold">
              Serta pilih intensitas dari rasa tersebut
            </span>
            . Angka 1 mewakili intensitas terendah.
          </p>
        </Callout>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {totalInput.map((numb) => (
            <div
              key={numb}
              className="p-2 border shadow-sm rounded-lg space-y-2"
            >
              <p className="font-medium text-center text-muted-foreground">
                #{numb}
              </p>
              <Input
                type="number"
                name={`treshold single-${numb}-code`}
                placeholder="Kode"
                required
              />
              <SelectTaste inputName={`treshold single-${numb}-value`} />
              <SelectIntensity inputName={`treshold single-${numb}-addValue`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TresholdMixForm({ index }: { index: number }) {
  const totalInput = [1, 2, 3, 4, 5];
  return (
    <div className="border rounded-lg space-y-2">
      <InputFormHeader
        sequenceNumber={index}
        numberOfSamples={5}
        examName="Treshold mix"
      />
      <div className="p-2">
        <Callout>
          <p>
            Di hadapan Anda terdapat 5 sampel. Cicipi secara berurutan.
            <span className="font-bold">
              Identifikasi kombinasi rasa beserta intensitasnya
            </span>
            . Intensitas rasa disesuaikan dengan sample uji threshold yang
            diberikan sebelumnya.
          </p>
        </Callout>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {totalInput.map((numb) => (
            <div
              key={numb}
              className="p-2 border shadow-sm rounded-lg space-y-2"
            >
              <p className="font-medium text-center text-muted-foreground">
                #{numb}
              </p>
              <Input
                type="number"
                placeholder="Kode"
                name={`treshold mix-${numb}-code`}
                required
              />
              <SelectTasteInten inputName={`treshold mix-${numb}-value`} />
              <SelectTasteInten inputName={`treshold mix-${numb}-addValue`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IdentifikasiForm({
  examEventId,
  index,
}: {
  examEventId: string;
  index: number;
}) {
  const totalInput = [1, 2, 3, 4, 5];
  return (
    <div className="border rounded-lg space-y-2">
      <InputFormHeader
        sequenceNumber={index}
        numberOfSamples={5}
        examName="Identifikasi"
      />
      <div className="p-2">
        <Callout>
          <p>
            Di hadapan Anda terdapat 5 sampel. Cicipi sampel secara beruntun.
            Identifikasi <span className="font-bold">masing-masing sampel</span>{" "}
            dengan memilih{" "}
            <span className="font-bold">
              nama sampelnya. DILARANG MENULISKAN PRODUK YANG SAMA
            </span>
            .
          </p>
        </Callout>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
          {totalInput.map((numb) => (
            <div
              key={numb}
              className="p-2 border shadow-sm rounded-lg space-y-2"
            >
              <p className="font-medium text-center text-muted-foreground">
                #{numb}
              </p>
              <Input
                type="number"
                name={`identifikasi-${numb}-code`}
                placeholder="Kode"
                required
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
    </div>
  );
}

function TriangleForm({ index }: { index: number }) {
  const values = ["beda", "sama", "sama"];
  return (
    <div className="border rounded-lg space-y-2">
      <InputFormHeader
        sequenceNumber={index}
        numberOfSamples={3}
        examName="Triangle"
      />
      <div className="p-2">
        <Callout>
          <p>
            Di hadapan Anda terdapat 3 sampel.{" "}
            <span className="font-bold">2 sampel sama</span> dan{" "}
            <span className="font-bold">1 sampel berbeda.</span> Cicipi sampel
            secara berurutan. Identifikasi{" "}
            <span className="font-bold">sampel mana yang berbeda.</span>
          </p>
        </Callout>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {values.map((value, index) => (
            <div
              key={index}
              className="p-2 border shadow-sm rounded-lg space-y-2"
            >
              <p className="font-medium text-center">{value}</p>
              <Input
                type="number"
                name={`triangle-${value}-${index}-code`}
                placeholder="Kode"
                required
              />
            </div>
          ))}
        </div>
        <div className="mt-4">
          <InputNote examName="triangle" />
        </div>
      </div>
    </div>
  );
}

function SkoringForm({ index }: { index: number }) {
  const values = ["1.5", "2", "3", "4", "5"];
  return (
    <div className="border rounded-lg space-y-2">
      <InputFormHeader
        sequenceNumber={index}
        numberOfSamples={5}
        examName="Skoring"
      />
      <div className="p-2">
        <Callout>
          <p>
            Di hadapan Anda terdapat 5 sampel. Cicipi sampel secara beruntun.
            <span className="font-bold">
              {" "}
              Identifikasi sampel dari yang paling kurang mantap (skor 1) hinnga
              sampel yang paling mantap (skor 5).
            </span>
          </p>
        </Callout>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-2">
          {values.map((value, index) => (
            <GenericInput key={index} examName="skoring" value={value} />
          ))}
        </div>
        <div className="mt-4">
          <InputNote examName="skoring" />
        </div>
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
      <Input
        type="number"
        name={`${examName}-${value}`}
        placeholder="kode"
        required
      />
    </div>
  );
}

function InputNote({ examName }: { examName: string }) {
  return (
    <div className="space-y-2">
      <Label className="ml-1">
        {examName === "triangle" ? "Alasan berbeda" : "Keterangan"}
      </Label>
      <Textarea
        name={`${examName}-note`}
        placeholder={`Masukkan ${examName === "triangle" ? "Alasan berbeda" : "Keterangan jawaban"} (wajib di isi)`}
        required
      />
    </div>
  );
}

function InputFormHeader({
  sequenceNumber,
  numberOfSamples,
  examName,
}: {
  sequenceNumber: number;
  numberOfSamples: number;
  examName: string;
}) {
  return (
    <div className="flex justify-between items-center p-2.5 border-b">
      <div className="flex gap-1 items-center">
        <p className="flex justify-center items-center w-7 h-7 shrink-0 aspect-square rounded-full bg-black text-white font-bold ">
          {sequenceNumber}
        </p>
        <p className="font-medium">{examName}</p>
      </div>
      <Badge variant="secondary">{numberOfSamples} sampel</Badge>
    </div>
  );
}
