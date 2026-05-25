import Link from "next/link";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Separator } from "./separator";
import DeleteDialogExamEvent from "./deleteExamEvent";
import EditDialogExamEvent from "./editDialogExamEvent";
import { getAllExamEvents } from "@/actions/examEvents";
import { formatJakartaTime, utcToWIB } from "@/lib/datetimeFormat";
import { ArrowRightIcon, ExternalLink, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./dropdown-menu";

type GetAllExamEventsResult = Awaited<ReturnType<typeof getAllExamEvents>>;
type ExamEventItem = NonNullable<GetAllExamEventsResult["data"]>[number];

export default function EventItem({
  id,
  examEventName,
  codeGroupRegulerId,
  codeGroupRetakeId,
  examStart,
  examEnd,
  updatedAt,
  selectedExams,
  totalParticipants,
}: ExamEventItem) {
  const examDateStart = new Date(examStart);
  const examTimeStart = to24Hour(examDateStart);
  const examDateEnd = new Date(examEnd);
  const examTimeEnd = to24Hour(examDateEnd);

  return (
    <div className="rounded-lg overflow-hidden border shadow flex flex-col justify-between">
      <div className="flex justify-between p-5 border-b border-border">
        <Link href={`ujian/${id}/peserta-ujian`}>
          <p className="font-medium line-clamp-2 overflow-ellipsis">
            {examEventName}
          </p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <EditDialogExamEvent
              eventId={id}
              eventName={examEventName}
              codeGroupReguler={codeGroupRegulerId ?? undefined}
              codeGroupRetake={codeGroupRetakeId ?? undefined}
              examDefaultDateStart={examDateStart}
              examDefaultDateEnd={examDateEnd}
              examDefaultTimeStart={examTimeStart}
              examDefaultTimeEnd={examTimeEnd}
            />
            <DeleteDialogExamEvent eventId={id} eventName={examEventName} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="px-5 py-2 flex flex-col gap-3">
        <div>
          <SectionTitle>DAFTAR UJIAN</SectionTitle>
          <div className="flex flex-wrap gap-1">
            {selectedExams?.split(",")?.map((exam) => (
              <Badge key={exam} variant="secondary">
                {exam}
              </Badge>
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <SectionTitle>TANGGAL / WAKTU UJIAN</SectionTitle>
          <div className="flex gap-2">
            <ExamDateTime examDateTime={examStart} variant="start" />
            <ArrowRightIcon size="18" className="self-center" />
            <ExamDateTime examDateTime={examEnd} variant="end" />
          </div>
        </div>
        <Separator />
        <div>
          <SectionTitle>KUOTA PESERTA UJIAN</SectionTitle>
          <p className="text-sm">{totalParticipants} Orang</p>
        </div>
        <Separator />
        <div>
          <SectionTitle>LINK BANK SOAL</SectionTitle>
          <div className="flex gap-2 flex-wrap">
            <BankExamUrl
              codeGroupRegulerId={codeGroupRegulerId}
              variant="reguler"
            />
            <BankExamUrl
              codeGroupRegulerId={codeGroupRetakeId}
              variant="retake"
            />
          </div>
        </div>
      </div>
      <div>
        <div className="px-4 bg-muted py-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Diperbarui : {utcToWIB(updatedAt.toISOString() || "")}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(`text-muted-foreground text-xs mb-0.5`, className)}
      {...props}
    >
      {children}
    </p>
  );
}

function ExamDateTime({
  examDateTime,
  variant,
}: {
  examDateTime: string;
  variant: "start" | "end";
}) {
  return (
    <div className="flex-1 px-2 py-1 rounded-md border border-border bg-sidebar-accent">
      <p className="text-xs text-muted-foreground">
        {variant === "start" ? "Mulai" : "Selesai"}
      </p>
      <p className="font-medium text-sm">
        {formatJakartaTime(examDateTime).split(",")[0]}
      </p>
      <p className="text-xs text-muted-foreground">
        {formatJakartaTime(examDateTime).split(",")[1]}
      </p>
    </div>
  );
}

function BankExamUrl({
  codeGroupRegulerId,
  variant,
}: {
  codeGroupRegulerId: string;
  variant: "reguler" | "retake";
}) {
  return (
    <Link
      href={`daftar-soal/${codeGroupRegulerId}`}
      target="_blank"
      className="flex-1 flex justify-center gap-2 items-center text-green-700 py-1 bg-green-100 rounded-md border border-green-200"
    >
      <span className="text-sm">
        {variant === "reguler" ? "Reguler" : "Mengulang"}
      </span>
      <ExternalLink size="14" />
    </Link>
  );
}

function to24Hour(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}
