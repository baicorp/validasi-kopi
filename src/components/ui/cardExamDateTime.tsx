import { formatJakartaTime } from "@/lib/datetimeFormat";

export function CardExamDateTime({
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
