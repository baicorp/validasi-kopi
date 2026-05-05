import Link from "next/link";
import { Badge } from "./badge";
import { Button } from "./button";
import { Separator } from "./separator";
import DeleteDialogExamEvent from "./deleteExamEvent";
import EditDialogExamEvent from "./editDialogExamEvent";
import { getAllExamEvents } from "@/actions/examEvents";
import { Clock, ExternalLink, MoreVertical } from "lucide-react";
import { formatJakartaTime, utcToWIB } from "@/lib/datetimeFormat";
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
      <div className="p-5 flex flex-col gap-2">
        <div className="flex justify-between">
          <Link href={`ujian/${id}/peserta-ujian`}>
            <p className="font-medium line-clamp-2 overflow-ellipsis">
              {examEventName}
            </p>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
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
        <div>
          <p className="text-muted-foreground mb-1">Daftar ujian</p>
          <div className="flex flex-wrap gap-1">
            {selectedExams?.split(",")?.map((exam) => (
              <Badge key={exam} variant="secondary">
                {exam}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-muted-foreground mb-1">Tanggal / Waktu Ujian</p>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <p className="text-sm">{formatJakartaTime(examStart)}</p>
            <span>→</span>
            <p className="text-sm">{formatJakartaTime(examEnd)}</p>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground">Kuota peserta ujian</p>
          <p>{totalParticipants} Orang</p>
        </div>
        <div>
          <p className="text-muted-foreground">Link bank soal</p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href={`daftar-soal/${codeGroupRegulerId}`}
              className="flex gap-1 items-center text-blue-700 hover:underline hover:decoration-wavy"
            >
              <span className="text-sm">Soal reguler</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <Link
              href={`daftar-soal/${codeGroupRetakeId}`}
              className="flex gap-1 items-center text-blue-700 hover:underline hover:decoration-wavy"
            >
              <span className="text-sm">Soal mengulang</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
      <div>
        <Separator />
        <div className="p-4 bg-muted">
          <p className="text-xs text-muted-foreground">
            Diperbarui : {utcToWIB(updatedAt || "")}
          </p>
        </div>
      </div>
    </div>
  );
}

function to24Hour(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}
