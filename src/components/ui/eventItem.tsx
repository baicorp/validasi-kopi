import Link from "next/link";
import { Badge } from "./badge";
import { Button } from "./button";
import { Separator } from "./separator";
import { utcToWIB } from "@/lib/datetimeFormat";
import { CardSectionTitle } from "./cardSectionTitle";
import { CardExamDateTime } from "./cardExamDateTime";
import DeleteDialogExamEvent from "./deleteExamEvent";
import EditDialogExamEvent from "./editDialogExamEvent";
import { getAllExamEvents } from "@/actions/examEvents";
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
          <CardSectionTitle>DAFTAR UJIAN</CardSectionTitle>
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
          <CardSectionTitle>TANGGAL / WAKTU UJIAN</CardSectionTitle>
          <div className="flex gap-2">
            <CardExamDateTime examDateTime={examStart} variant="start" />
            <ArrowRightIcon size="18" className="self-center" />
            <CardExamDateTime examDateTime={examEnd} variant="end" />
          </div>
        </div>
        <Separator />
        <div>
          <CardSectionTitle>KUOTA PESERTA UJIAN</CardSectionTitle>
          <p className="text-sm">{totalParticipants} Orang</p>
        </div>
        <Separator />
        <div>
          <CardSectionTitle>LINK BANK SOAL</CardSectionTitle>
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
            Diperbarui : {utcToWIB(updatedAt || "")}
          </p>
        </div>
      </div>
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
