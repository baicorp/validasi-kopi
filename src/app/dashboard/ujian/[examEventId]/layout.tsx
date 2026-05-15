import Link from "next/link";
import { cn } from "@/lib/utils";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import ErrorComp from "@/components/ui/error";
import { Label } from "@/components/ui/label";
import InteractiveLink from "@/components/ui/link";
import Loading from "@/components/skeleton/loading";
import { getExamEventById } from "@/actions/examEvents";
import { ArrowRight, ExternalLink } from "lucide-react";
import { formatJakartaTime } from "@/lib/datetimeFormat";
import ExamEventPeriode from "@/components/ui/examEventPeriode";

export default async function Layout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ examEventId: string }>;
}>) {
  const { examEventId } = await params;
  return (
    <>
      <section>
        <div className="flex rounded-lg p-1 bg-accent w-fit my-3">
          <InteractiveLink href={"peserta-ujian"}>
            Peserta ujian
          </InteractiveLink>
          <InteractiveLink href={`rekap-jawaban`}>
            Rekap jawaban
          </InteractiveLink>
          <InteractiveLink href={`hasil-ujian`}>Hasil ujian</InteractiveLink>
        </div>
      </section>
      <section>
        <Suspense fallback={<Loading />}>
          <ExamEventDetails examEventId={examEventId} />
        </Suspense>
      </section>
      {children}
    </>
  );
}

async function ExamEventDetails({ examEventId }: { examEventId: string }) {
  const examEvent = await getExamEventById(examEventId);

  if ("error" in examEvent) {
    return <ErrorComp error={examEvent.error} />;
  }

  const currentUTCTime = new Date().toISOString();
  const examStartInUTCTime = examEvent.examStart.replace(" ", "T") + "Z";
  const examEndInUTCTime = examEvent.examEnd.replace(" ", "T") + "Z";
  let variant: "akan datang" | "berlangsung" | "selesai";

  if (currentUTCTime >= examEndInUTCTime) {
    variant = "selesai";
  } else if (
    currentUTCTime >= examStartInUTCTime &&
    currentUTCTime <= examEndInUTCTime
  ) {
    variant = "berlangsung";
  } else {
    variant = "akan datang";
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <ExamEventDetailHeader
        examEventName={examEvent.examEventName}
        examEventId={examEvent.id}
        selectedExams={examEvent.selectedExams}
        variant={variant}
      />
      <div className="flex flex-wrap">
        <div className="flex-1 px-5 py-4 space-y-1 border-r border-t border-border">
          <Label className="text-muted-foreground">TANGGAL / WAKTU UJIAN</Label>
          <div className="text-sm font-mono">
            <p>{formatJakartaTime(examEvent.examStart)}</p>
            <div className="flex gap-2 items-center">
              <ArrowRight size={14} />
              <p>{formatJakartaTime(examEvent.examEnd)}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 px-5 py-4 space-y-1 border-r border-t border-border">
          <Label className="text-muted-foreground">LINK BANK SOAL</Label>
          <div className="flex flex-col">
            <Link
              href={`/dashboard/daftar-soal/${examEvent.codeGroupRegulerId}`}
              target="_blank"
              className="flex gap-1 items-center text-blue-700 hover:underline hover:decoration-wavy"
            >
              <span className="text-sm">Reguler</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href={`/dashboard/daftar-soal/${examEvent.codeGroupRetakeId}`}
              target="_blank"
              className="flex gap-1 items-center text-blue-700 hover:underline hover:decoration-wavy"
            >
              <span className="text-sm">Mengulang</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
        <div className="flex-1 px-5 py-4 border-t border-border space-y-1">
          <Label className="text-muted-foreground">KUOTA PESERTA UJIAN</Label>
          <div className="flex gap-2">
            <p className="text-4xl font-bold font-mono">
              {examEvent.totalParticipants}
            </p>
            <span className="text-sm self-end">Orang</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExamEventDetailHeader({
  examEventName,
  examEventId,
  selectedExams,
  variant,
}: {
  examEventName: string;
  examEventId: string;
  selectedExams: string;
  variant: "akan datang" | "berlangsung" | "selesai";
}) {
  return (
    <div
      className={cn("px-5 py-4 border-l-6", {
        "border-[#B5D4F4]": variant === "akan datang",
        "border-[#FAC775]": variant === "berlangsung",
        "border-[#C0DD97]": variant === "selesai",
      })}
    >
      <div className="flex justify-between">
        <p className="text-lg font-semibold">{examEventName}</p>
        <ExamEventPeriode variant={variant} />
      </div>
      <p className="text-sm mb-1 text-muted-foreground">
        ID : <span className="font-mono">{examEventId}</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {selectedExams?.split(",")?.map((exam) => (
          <Badge variant={"secondary"} key={exam}>
            {exam}
          </Badge>
        ))}
      </div>
    </div>
  );
}
