import Link from "next/link";
import { Clock } from "lucide-react";
import { Separator } from "./separator";
import { toTitleCase } from "@/lib/utils";
import { InferSelectModel } from "drizzle-orm";
import { examEvents } from "@/db/schema/examEvents";
import { formatLocalTime } from "@/lib/datetimeFormat";
import EditDialogExamEvent from "./editDialogExamEvent";

export default function EventItem({
  id,
  examEventName,
  examStart,
  examEnd,
  updatedAt,
}: InferSelectModel<typeof examEvents>) {
  const examDateStart = new Date(examStart);
  const examTimeStart = to24Hour(examDateStart);
  const examDateEnd = new Date(examEnd);
  const examTimeEnd = to24Hour(examDateEnd);

  return (
    <div className="rounded-lg overflow-hidden border shadow relative">
      <div className="absolute right-4 top-4">
        <EditDialogExamEvent
          eventId={id}
          eventName={examEventName}
          examDefaultDateStart={examDateStart}
          examDefaultDateEnd={examDateEnd}
          examDefaultTimeStart={examTimeStart}
          examDefaultTimeEnd={examTimeEnd}
        />
      </div>
      <div className="p-5 flex flex-col gap-2">
        <Link href={`ujian/${id}/peserta-ujian`}>
          <p className="font-medium">{toTitleCase(examEventName)}</p>
        </Link>
        <div>
          <p className="text-muted-foreground mb-1">Pelaksanaan</p>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <p className="text-sm">{formatLocalTime(examStart)}</p>
            <span>→</span>
            <p className="text-sm">{formatLocalTime(examEnd)}</p>
          </div>
        </div>
      </div>
      <Separator />
      <div className="p-4 bg-muted">
        <p className="text-xs text-muted-foreground">
          Diperbarui : {new Date(updatedAt + "Z").toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function to24Hour(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}
