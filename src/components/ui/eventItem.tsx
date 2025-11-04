import { Clock } from "lucide-react";
import { Calendar } from "./calendar";
import { Separator } from "./separator";
import { toTitleCase } from "@/lib/utils";
import { InferSelectModel } from "drizzle-orm";
import { examEvents } from "@/db/schema/examEvents";
import { formatLocalTime } from "@/lib/datetimeFormat";

export default function EventItem({
  examEventName,
  registrationStart,
  registrationEnd,
  examStart,
  examEnd,
  updatedAt,
}: InferSelectModel<typeof examEvents>) {
  return (
    <div className="rounded-lg overflow-hidden border shadow">
      <div className="p-5 flex flex-col gap-2">
        <p className="font-medium">{toTitleCase(examEventName)}</p>
        <div>
          <p className="text-muted-foreground mb-1">Registrasi</p>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <p className="text-sm">{formatLocalTime(registrationStart)}</p>
            <span>→</span>
            <p className="text-sm">{formatLocalTime(registrationEnd)}</p>
          </div>
        </div>
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
