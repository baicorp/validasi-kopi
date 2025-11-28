import {
  getExamEventById,
  getExamInputFormBasedOnSelectedExamForm,
} from "@/actions/examEvents";
import { Suspense } from "react";
import { Calendar } from "lucide-react";
import { redirect } from "next/navigation";
import ErrorComp from "@/components/ui/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Callout from "@/components/ui/callout";
import { Textarea } from "@/components/ui/textarea";
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
  const result = await getExamEventById(examEventId);

  if ("error" in result) {
    return <ErrorComp error={result.error} />;
  }

  return (
    <div className="grid grid-cols-[auto_auto_1fr] gap-x-3">
      <p>Nama ujian</p>
      <span> : </span>
      <p>{result.examEventName}</p>
      <p>Keterangan</p>
      <span> : </span>
      <Suspense fallback={<span>...</span>}>
        <AttemptDescription examEventId={examEventId} />
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

async function AttemptDescription({ examEventId }: { examEventId: string }) {
  const result = await getUserLatestExamAttemptNumber(examEventId);

  if ("error" in result) {
    return <ErrorComp error={result.error} />;
  }
  const currentAttempt = result.latestAttempt + 1;

  return currentAttempt === 1 ? (
    <span>Ujian Reguler</span>
  ) : (
    <span>
      Ujian mengulang <span>({currentAttempt - 1} / 3)</span>
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
    case "2 out of 5 creamer":
      return <TwoOutOfFive examEventId={examEventId} examName={examName} />;
    case "2 out of 5 pure":
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
      <Callout>
        <p>
          Di hadapan Anda terdapat 5 sampel,{" "}
          <span className="font-bold">2 sampel yang sama</span> dan{" "}
          <span className="font-bold">3 sampel berbeda</span>. Cicipi sampel
          secara berurutan. Identifikasikan{" "}
          <span className="font-bold">sampel mana yang sama.</span>
        </p>
      </Callout>
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
      <Callout>
        <p>
          Di hadapan Anda terdapat 3 sampel.{" "}
          <span className="font-bold">2 sampel sama</span> dan{" "}
          <span className="font-bold">1 sampel berbeda.</span> Cicipi sampel
          secara berurutan. Identifikasi{" "}
          <span className="font-bold">sampel mana yang berbeda.</span>
        </p>
      </Callout>
      <div className="grid grid-cols-3 gap-2">
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
            />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <InputNote examName="triangle" />
      </div>
    </div>
  );
}

function SkoringForm() {
  const values = ["1.5", "2", "3", "4", "5"];
  return (
    <div className="p-2 border rounded-lg space-y-2">
      <p className="font-medium">Skoring</p>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {values.map((value, index) => (
          <GenericInput key={index} examName="skoring" value={value} />
        ))}
      </div>
      <div className="mt-4">
        <InputNote examName="skoring" />
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
